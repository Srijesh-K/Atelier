import { query, execute, getConnection } from '@/utils/db-sql';
import { evaluateResponse } from './evaluator.js';

// ─────────────────────────────────────────────────────────────
// ASSESSMENTS MANAGEMENT (Course-owned)
// ─────────────────────────────────────────────────────────────

export async function getAssessmentsByCourse(courseId) {
  const sql = `
    SELECT 
      a.*,
      c.title AS course_title,
      COUNT(DISTINCT aq.question_id) AS question_count,
      COUNT(DISTINCT att.id) AS attempt_count,
      AVG(att.percentage) AS avg_percentage
    FROM atelier_assessments a
    LEFT JOIN atelier_courses c ON a.course_id = c.id
    LEFT JOIN atelier_assessment_questions aq ON a.id = aq.assessment_id
    LEFT JOIN atelier_attempts att ON a.id = att.assessment_id AND att.status IN ('submitted', 'evaluated')
    WHERE a.course_id = ?
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  const rows = await query(sql, [courseId]);
  return rows.map(r => ({
    ...r,
    proctoring_config: r.proctoring_config ? safeJsonParse(r.proctoring_config) : {}
  }));
}

export async function getAllAssessmentsAdmin() {
  const sql = `
    SELECT 
      a.*,
      c.title AS course_title,
      COUNT(DISTINCT aq.question_id) AS question_count,
      COUNT(DISTINCT att.id) AS attempt_count,
      AVG(att.percentage) AS avg_percentage
    FROM atelier_assessments a
    LEFT JOIN atelier_courses c ON a.course_id = c.id
    LEFT JOIN atelier_assessment_questions aq ON a.id = aq.assessment_id
    LEFT JOIN atelier_attempts att ON a.id = att.assessment_id AND att.status IN ('submitted', 'evaluated')
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  const rows = await query(sql);
  return rows.map(r => ({
    ...r,
    proctoring_config: r.proctoring_config ? safeJsonParse(r.proctoring_config) : {}
  }));
}

export async function getAssessmentById(assessmentId, includeQuestions = true) {
  const [assessment] = await query(
    `SELECT a.*, c.title AS course_title 
     FROM atelier_assessments a 
     LEFT JOIN atelier_courses c ON a.course_id = c.id 
     WHERE a.id = ? LIMIT 1`,
    [assessmentId]
  );
  if (!assessment) return null;

  assessment.proctoring_config = assessment.proctoring_config ? safeJsonParse(assessment.proctoring_config) : {};

  // Fetch sections
  const sections = await query(
    `SELECT * FROM atelier_assessment_sections WHERE assessment_id = ? ORDER BY sort_order ASC, id ASC`,
    [assessmentId]
  );
  assessment.sections = sections;

  if (includeQuestions) {
    // Fetch linked questions
    const qRows = await query(`
      SELECT 
        q.*,
        aq.section_id,
        aq.sort_order AS assessment_sort_order,
        COALESCE(aq.marks, q.marks) AS assessment_marks
      FROM atelier_assessment_questions aq
      JOIN atelier_questions q ON aq.question_id = q.id
      WHERE aq.assessment_id = ?
      ORDER BY aq.sort_order ASC, q.id ASC
    `, [assessmentId]);

    const questionIds = qRows.map(q => q.id);
    let optionsByQ = {};
    let testCasesByQ = {};
    let rubricsByQ = {};

    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => '?').join(',');
      
      const options = await query(
        `SELECT * FROM atelier_question_options WHERE question_id IN (${placeholders}) ORDER BY sort_order ASC`,
        questionIds
      );
      for (const opt of options) {
        if (!optionsByQ[opt.question_id]) optionsByQ[opt.question_id] = [];
        optionsByQ[opt.question_id].push(opt);
      }

      const testCases = await query(
        `SELECT * FROM atelier_question_test_cases WHERE question_id IN (${placeholders}) ORDER BY id ASC`,
        questionIds
      );
      for (const tc of testCases) {
        if (!testCasesByQ[tc.question_id]) testCasesByQ[tc.question_id] = [];
        testCasesByQ[tc.question_id].push(tc);
      }

      const rubrics = await query(
        `SELECT * FROM atelier_question_rubrics WHERE question_id IN (${placeholders}) ORDER BY id ASC`,
        questionIds
      );
      for (const rub of rubrics) {
        if (!rubricsByQ[rub.question_id]) rubricsByQ[rub.question_id] = [];
        rubricsByQ[rub.question_id].push(rub);
      }
    }

    assessment.questions = qRows.map(q => ({
      ...q,
      marks: q.assessment_marks,
      config_json: q.config_json ? safeJsonParse(q.config_json) : null,
      options: optionsByQ[q.id] || [],
      test_cases: testCasesByQ[q.id] || [],
      rubrics: rubricsByQ[q.id] || []
    }));
  }

  return assessment;
}

export async function saveAssessment(assessmentData) {
  const {
    id,
    course_id,
    title,
    description = '',
    duration_minutes = 60,
    passing_marks = 0,
    max_attempts = 1,
    status = 'draft',
    randomize_questions = 0,
    randomize_options = 0,
    sequential_navigation = 0,
    proctoring_enabled = 0,
    proctoring_config = null,
    grading_policy = 'best',
    show_results_immediately = 1
  } = assessmentData;

  const proctorStr = proctoring_config ? (typeof proctoring_config === 'string' ? proctoring_config : JSON.stringify(proctoring_config)) : null;

  if (id) {
    await execute(`
      UPDATE atelier_assessments SET
        title = ?,
        description = ?,
        duration_minutes = ?,
        passing_marks = ?,
        max_attempts = ?,
        status = ?,
        randomize_questions = ?,
        randomize_options = ?,
        sequential_navigation = ?,
        proctoring_enabled = ?,
        proctoring_config = ?,
        grading_policy = ?,
        show_results_immediately = ?
      WHERE id = ?
    `, [
      title, description, duration_minutes, passing_marks, max_attempts,
      status, randomize_questions ? 1 : 0, randomize_options ? 1 : 0,
      sequential_navigation ? 1 : 0, proctoring_enabled ? 1 : 0,
      proctorStr, grading_policy, show_results_immediately ? 1 : 0,
      id
    ]);
    await recalculateAssessmentTotalMarks(id);
    return { success: true, id };
  } else {
    const res = await execute(`
      INSERT INTO atelier_assessments (
        course_id, title, description, duration_minutes, passing_marks,
        max_attempts, status, randomize_questions, randomize_options,
        sequential_navigation, proctoring_enabled, proctoring_config,
        grading_policy, show_results_immediately
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      course_id, title, description, duration_minutes, passing_marks,
      max_attempts, status, randomize_questions ? 1 : 0, randomize_options ? 1 : 0,
      sequential_navigation ? 1 : 0, proctoring_enabled ? 1 : 0,
      proctorStr, grading_policy, show_results_immediately ? 1 : 0
    ]);
    return { success: true, id: res.insertId };
  }
}

export async function deleteAssessment(assessmentId) {
  await execute(`DELETE FROM atelier_assessments WHERE id = ?`, [assessmentId]);
  return { success: true };
}

export async function recalculateAssessmentTotalMarks(assessmentId) {
  const rows = await query(`
    SELECT COALESCE(SUM(COALESCE(aq.marks, q.marks)), 0) AS total 
    FROM atelier_assessment_questions aq
    JOIN atelier_questions q ON aq.question_id = q.id
    WHERE aq.assessment_id = ?
  `, [assessmentId]);
  const total = rows[0]?.total || 0;
  await execute(`UPDATE atelier_assessments SET total_marks = ? WHERE id = ?`, [total, assessmentId]);
  return total;
}

// ─────────────────────────────────────────────────────────────
// SECTIONS MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function saveAssessmentSection({ id, assessment_id, title, description = '', sort_order = 0 }) {
  if (id) {
    await execute(`
      UPDATE atelier_assessment_sections SET title = ?, description = ?, sort_order = ? WHERE id = ?
    `, [title, description, sort_order, id]);
    return { success: true, id };
  } else {
    const res = await execute(`
      INSERT INTO atelier_assessment_sections (assessment_id, title, description, sort_order)
      VALUES (?, ?, ?, ?)
    `, [assessment_id, title, description, sort_order]);
    return { success: true, id: res.insertId };
  }
}

export async function deleteAssessmentSection(sectionId) {
  await execute(`DELETE FROM atelier_assessment_sections WHERE id = ?`, [sectionId]);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// QUESTION BANK MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function getCourseQuestionBank(courseId) {
  const questions = await query(`
    SELECT * FROM atelier_questions WHERE course_id = ? ORDER BY created_at DESC
  `, [courseId]);

  const questionIds = questions.map(q => q.id);
  let optionsByQ = {};
  let rubricsByQ = {};

  if (questionIds.length > 0) {
    const placeholders = questionIds.map(() => '?').join(',');
    const options = await query(
      `SELECT * FROM atelier_question_options WHERE question_id IN (${placeholders}) ORDER BY sort_order ASC`,
      questionIds
    );
    for (const opt of options) {
      if (!optionsByQ[opt.question_id]) optionsByQ[opt.question_id] = [];
      optionsByQ[opt.question_id].push(opt);
    }

    const rubrics = await query(
      `SELECT * FROM atelier_question_rubrics WHERE question_id IN (${placeholders}) ORDER BY id ASC`,
      questionIds
    );
    for (const rub of rubrics) {
      if (!rubricsByQ[rub.question_id]) rubricsByQ[rub.question_id] = [];
      rubricsByQ[rub.question_id].push(rub);
    }
  }

  return questions.map(q => ({
    ...q,
    config_json: q.config_json ? safeJsonParse(q.config_json) : null,
    options: optionsByQ[q.id] || [],
    rubrics: rubricsByQ[q.id] || []
  }));
}

export async function saveQuestion(questionData) {
  const {
    id,
    course_id,
    title,
    question_text,
    question_type,
    difficulty = 'medium',
    marks = 1,
    negative_marks = 0,
    partial_credit = 0,
    tags = '',
    config_json = null,
    options = [],
    test_cases = [],
    rubrics = []
  } = questionData;

  const configStr = config_json ? (typeof config_json === 'string' ? config_json : JSON.stringify(config_json)) : null;

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    let questionId = id;
    if (questionId) {
      await conn.execute(`
        UPDATE atelier_questions SET
          title = ?,
          question_text = ?,
          question_type = ?,
          difficulty = ?,
          marks = ?,
          negative_marks = ?,
          partial_credit = ?,
          tags = ?,
          config_json = ?
        WHERE id = ?
      `, [
        title, question_text, question_type, difficulty, marks,
        negative_marks, partial_credit ? 1 : 0, tags, configStr, questionId
      ]);
    } else {
      const [res] = await conn.execute(`
        INSERT INTO atelier_questions (
          course_id, title, question_text, question_type, difficulty, marks,
          negative_marks, partial_credit, tags, config_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        course_id, title, question_text, question_type, difficulty, marks,
        negative_marks, partial_credit ? 1 : 0, tags, configStr
      ]);
      questionId = res.insertId;
    }

    // Replace options if provided
    if (Array.isArray(options)) {
      await conn.execute(`DELETE FROM atelier_question_options WHERE question_id = ?`, [questionId]);
      let order = 1;
      for (const opt of options) {
        if (!opt.option_text) continue;
        await conn.execute(`
          INSERT INTO atelier_question_options (question_id, option_text, is_correct, explanation, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `, [questionId, opt.option_text, opt.is_correct ? 1 : 0, opt.explanation || null, order++]);
      }
    }

    // Replace test cases if provided
    if (Array.isArray(test_cases)) {
      await conn.execute(`DELETE FROM atelier_question_test_cases WHERE question_id = ?`, [questionId]);
      for (const tc of testCases) {
        if (!tc.expected_output && tc.expected_output !== '') continue;
        await conn.execute(`
          INSERT INTO atelier_question_test_cases (question_id, input, expected_output, is_hidden, marks, explanation)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [questionId, tc.input || null, tc.expected_output, tc.is_hidden ? 1 : 0, tc.marks || 0, tc.explanation || null]);
      }
    }

    // Replace rubrics if provided
    if (Array.isArray(rubrics)) {
      await conn.execute(`DELETE FROM atelier_question_rubrics WHERE question_id = ?`, [questionId]);
      for (const rub of rubrics) {
        if (!rub.criterion) continue;
        await conn.execute(`
          INSERT INTO atelier_question_rubrics (question_id, criterion, max_marks, description)
          VALUES (?, ?, ?, ?)
        `, [questionId, rub.criterion, rub.max_marks || 1, rub.description || null]);
      }
    }

    await conn.commit();
    return { success: true, id: questionId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteQuestion(questionId) {
  await execute(`DELETE FROM atelier_questions WHERE id = ?`, [questionId]);
  return { success: true };
}

export async function linkQuestionToAssessment({ assessment_id, question_id, section_id = null, sort_order = 0, marks = null }) {
  // If marks not specified, default to question's default marks
  let effectiveMarks = marks;
  if (effectiveMarks === null || effectiveMarks === undefined) {
    const [q] = await query(`SELECT marks FROM atelier_questions WHERE id = ? LIMIT 1`, [question_id]);
    effectiveMarks = q ? q.marks : 1;
  }

  await execute(`
    INSERT INTO atelier_assessment_questions (assessment_id, section_id, question_id, sort_order, marks)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      section_id = VALUES(section_id),
      sort_order = VALUES(sort_order),
      marks = VALUES(marks)
  `, [assessment_id, section_id, question_id, sort_order, effectiveMarks]);

  await recalculateAssessmentTotalMarks(assessment_id);
  return { success: true };
}

export async function unlinkQuestionFromAssessment(assessment_id, question_id) {
  await execute(`
    DELETE FROM atelier_assessment_questions WHERE assessment_id = ? AND question_id = ?
  `, [assessment_id, question_id]);

  await recalculateAssessmentTotalMarks(assessment_id);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// STUDENT ENROLLMENT & ATTEMPTS
// ─────────────────────────────────────────────────────────────

export async function getStudentCourseAssessments(studentId, courseId = null) {
  let sql = `
    SELECT 
      a.*,
      c.title AS course_title,
      COUNT(DISTINCT aq.question_id) AS question_count
    FROM atelier_assessments a
    JOIN atelier_courses c ON a.course_id = c.id
    JOIN atelier_student_courses sc ON sc.course_id = a.course_id
    LEFT JOIN atelier_assessment_questions aq ON a.id = aq.assessment_id
    WHERE sc.student_id = ? AND a.status = 'published'
  `;
  const params = [studentId];
  if (courseId) {
    sql += ` AND a.course_id = ?`;
    params.push(courseId);
  }
  sql += ` GROUP BY a.id ORDER BY a.created_at DESC`;

  const assessments = await query(sql, params);

  // For each assessment, fetch student's attempt summary
  for (const asst of assessments) {
    const attempts = await query(`
      SELECT id, attempt_number, status, started_at, ends_at, submitted_at, total_score, percentage, passed, proctoring_flags
      FROM atelier_attempts
      WHERE assessment_id = ? AND student_id = ?
      ORDER BY attempt_number DESC
    `, [asst.id, studentId]);

    asst.attempts = attempts;
    asst.latest_attempt = attempts[0] || null;
    asst.has_active_attempt = attempts.some(att => att.status === 'in_progress');
    asst.attempts_remaining = Math.max(0, asst.max_attempts - attempts.length);
  }

  return assessments;
}

export async function startOrResumeAttempt(studentId, assessmentId) {
  // 1. Verify student is enrolled in the course or auto-enroll for active assessment
  let [enrollment] = await query(`
    SELECT sc.course_id 
    FROM atelier_student_courses sc
    JOIN atelier_assessments a ON a.course_id = sc.course_id
    WHERE sc.student_id = ? AND a.id = ? LIMIT 1
  `, [studentId, assessmentId]);

  if (!enrollment) {
    const [asst] = await query(`SELECT course_id FROM atelier_assessments WHERE id = ?`, [assessmentId]);
    if (asst && asst.course_id) {
      await execute(`INSERT IGNORE INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)`, [studentId, asst.course_id]);
      enrollment = { course_id: asst.course_id };
    }
  }

  if (!enrollment) {
    throw new Error('Access denied: You must be enrolled in this course to take the assessment.');
  }

  // 2. Check for an active in_progress attempt
  const [activeAttempt] = await query(`
    SELECT * FROM atelier_attempts 
    WHERE assessment_id = ? AND student_id = ? AND status = 'in_progress'
    LIMIT 1
  `, [assessmentId, studentId]);

  if (activeAttempt) {
    const remainingSeconds = Math.max(0, Math.floor((new Date(activeAttempt.ends_at).getTime() - Date.now()) / 1000));
    if (remainingSeconds <= 0) {
      // Auto-submit expired attempt
      await submitAssessmentAttempt(studentId, activeAttempt.id);
      return { expired: true, attemptId: activeAttempt.id };
    }
    return { attemptId: activeAttempt.id, resumed: true, remainingSeconds };
  }

  // 3. Check attempt count limits
  const [assessment] = await query(`SELECT * FROM atelier_assessments WHERE id = ?`, [assessmentId]);
  if (!assessment || assessment.status !== 'published') {
    throw new Error('This assessment is not currently available.');
  }

  const prevAttempts = await query(`
    SELECT COUNT(*) as count FROM atelier_attempts WHERE assessment_id = ? AND student_id = ?
  `, [assessmentId, studentId]);
  const attemptCount = prevAttempts[0]?.count || 0;

  if (attemptCount >= assessment.max_attempts) {
    throw new Error(`Maximum attempts (${assessment.max_attempts}) reached for this assessment.`);
  }

  const attemptNumber = attemptCount + 1;
  const durationMinutes = assessment.duration_minutes || 60;
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  const startedAtStr = startedAt.toISOString().slice(0, 19).replace('T', ' ');
  const endsAtStr = endsAt.toISOString().slice(0, 19).replace('T', ' ');

  // 4. Fetch questions to freeze snapshot
  const rawQuestions = await query(`
    SELECT 
      q.*,
      aq.section_id,
      aq.sort_order AS assessment_sort_order,
      COALESCE(aq.marks, q.marks) AS assessment_marks
    FROM atelier_assessment_questions aq
    JOIN atelier_questions q ON aq.question_id = q.id
    WHERE aq.assessment_id = ?
    ORDER BY aq.sort_order ASC, q.id ASC
  `, [assessmentId]);

  if (rawQuestions.length === 0) {
    throw new Error('This assessment has no questions configured.');
  }

  // Handle randomization if requested
  let questions = [...rawQuestions];
  if (assessment.randomize_questions) {
    questions.sort(() => Math.random() - 0.5);
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [attRes] = await conn.execute(`
      INSERT INTO atelier_attempts (
        assessment_id, student_id, attempt_number, status, started_at, ends_at, proctoring_flags
      ) VALUES (?, ?, ?, 'in_progress', ?, ?, 0)
    `, [assessmentId, studentId, attemptNumber, startedAtStr, endsAtStr]);
    const attemptId = attRes.insertId;

    // Freeze each question into atelier_attempt_questions
    let order = 1;
    for (const q of questions) {
      // Fetch options
      const options = await query(`
        SELECT id, option_text, sort_order 
        FROM atelier_question_options 
        WHERE question_id = ? 
        ORDER BY sort_order ASC
      `, [q.id]);

      // If randomize options
      if (assessment.randomize_options) {
        options.sort(() => Math.random() - 0.5);
      }

      // Rubrics description (without answer key)
      const rubrics = await query(`
        SELECT id, criterion, max_marks, description FROM atelier_question_rubrics WHERE question_id = ?
      `, [q.id]);

      const effectiveMarks = q.assessment_marks ?? q.marks ?? 1;

      const snapshot = {
        id: q.id,
        title: q.title,
        question_text: q.question_text,
        question_type: q.question_type,
        marks: effectiveMarks,
        negative_marks: q.negative_marks || 0,
        tags: q.tags || '',
        config: q.config_json ? safeJsonParse(q.config_json) : null,
        options,
        rubrics
      };

      await conn.execute(`
        INSERT INTO atelier_attempt_questions (attempt_id, question_id, section_id, sort_order, marks, question_snapshot)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [attemptId, q.id, q.section_id ?? null, order++, effectiveMarks, JSON.stringify(snapshot)]);

      // Initialize empty response record
      await conn.execute(`
        INSERT INTO atelier_responses (attempt_id, question_id, response_data, status, marks_awarded, max_marks)
        VALUES (?, ?, NULL, 'unanswered', 0, ?)
      `, [attemptId, q.id, effectiveMarks]);
    }

    await conn.commit();
    return {
      attemptId,
      resumed: false,
      remainingSeconds: durationMinutes * 60
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getAttemptPlayerState(studentId, attemptId) {
  const [attempt] = await query(`
    SELECT 
      att.*,
      a.title AS assessment_title,
      a.description AS assessment_description,
      a.duration_minutes,
      a.sequential_navigation,
      a.proctoring_enabled,
      a.proctoring_config,
      c.title AS course_title
    FROM atelier_attempts att
    JOIN atelier_assessments a ON att.assessment_id = a.id
    JOIN atelier_courses c ON a.course_id = c.id
    WHERE att.id = ? AND att.student_id = ? LIMIT 1
  `, [attemptId, studentId]);

  if (!attempt) {
    throw new Error('Attempt not found or unauthorized.');
  }

  const remainingSeconds = Math.max(0, Math.floor((new Date(attempt.ends_at).getTime() - Date.now()) / 1000));
  attempt.remainingSeconds = remainingSeconds;
  attempt.proctoring_config = attempt.proctoring_config ? safeJsonParse(attempt.proctoring_config) : {};

  // Fetch sections
  const sections = await query(`
    SELECT * FROM atelier_assessment_sections WHERE assessment_id = ? ORDER BY sort_order ASC
  `, [attempt.assessment_id]);

  // Fetch frozen questions
  const attemptQuestions = await query(`
    SELECT 
      aq.question_id,
      aq.section_id,
      aq.sort_order,
      aq.marks,
      aq.question_snapshot,
      r.response_data,
      r.status AS response_status,
      r.marks_awarded,
      r.evaluator_feedback
    FROM atelier_attempt_questions aq
    LEFT JOIN atelier_responses r ON r.attempt_id = aq.attempt_id AND r.question_id = aq.question_id
    WHERE aq.attempt_id = ?
    ORDER BY aq.sort_order ASC
  `, [attemptId]);

  const questions = attemptQuestions.map(aq => {
    const snap = aq.question_snapshot ? safeJsonParse(aq.question_snapshot) : {};
    return {
      id: aq.question_id,
      section_id: aq.section_id,
      sort_order: aq.sort_order,
      marks: aq.marks,
      title: snap.title || '',
      question_text: snap.question_text || '',
      question_type: snap.question_type || '',
      negative_marks: snap.negative_marks || 0,
      config: snap.config || null,
      options: snap.options || [],
      rubrics: snap.rubrics || [],
      // Existing student response
      student_response: aq.response_data ? safeJsonParse(aq.response_data) : null,
      response_status: aq.response_status || 'unanswered'
    };
  });

  return {
    attempt,
    sections,
    questions
  };
}

export async function saveAttemptProgress(studentId, attemptId, responses) {
  // responses: [{ questionId, responseData }]
  const [attempt] = await query(`
    SELECT id, status, ends_at FROM atelier_attempts WHERE id = ? AND student_id = ? LIMIT 1
  `, [attemptId, studentId]);

  if (!attempt || attempt.status !== 'in_progress') {
    throw new Error('Cannot save progress: Assessment attempt is not active.');
  }

  // Grace buffer: 30 seconds
  const isTimeOver = (Date.now() - new Date(attempt.ends_at).getTime()) > 30000;
  if (isTimeOver) {
    await submitAssessmentAttempt(studentId, attemptId);
    return { autoSubmitted: true };
  }

  for (const item of responses) {
    const jsonStr = item.responseData !== undefined && item.responseData !== null 
      ? JSON.stringify(item.responseData) 
      : null;

    const status = (item.responseData !== null && item.responseData !== '' && item.responseData !== undefined)
      ? 'saved' 
      : 'unanswered';

    await execute(`
      UPDATE atelier_responses SET response_data = ?, status = ?
      WHERE attempt_id = ? AND question_id = ?
    `, [jsonStr, status, attemptId, item.questionId]);
  }

  return { success: true, savedAt: new Date().toISOString() };
}

export async function recordProctoringEvent(studentId, attemptId, eventType, metadata = null) {
  const metaStr = metadata ? JSON.stringify(metadata) : null;
  const now = new Date();

  await execute(`
    INSERT INTO atelier_proctoring_events (attempt_id, student_id, event_type, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `, [attemptId, studentId, eventType, metaStr, now]);

  if (['tab_switch', 'window_blur', 'fullscreen_exit', 'devtools_open'].includes(eventType)) {
    await execute(`
      UPDATE atelier_attempts SET proctoring_flags = proctoring_flags + 1 WHERE id = ?
    `, [attemptId]);
  }

  return { success: true };
}

export async function submitAssessmentAttempt(studentId, attemptId, finalResponses = null) {
  const [attempt] = await query(`
    SELECT att.*, a.passing_marks, a.total_marks 
    FROM atelier_attempts att
    JOIN atelier_assessments a ON att.assessment_id = a.id
    WHERE att.id = ? AND att.student_id = ? LIMIT 1
  `, [attemptId, studentId]);

  if (!attempt) {
    throw new Error('Attempt not found or unauthorized.');
  }

  if (['submitted', 'evaluated'].includes(attempt.status)) {
    return { alreadySubmitted: true, attemptId };
  }

  // 1. Save any final response payload
  if (Array.isArray(finalResponses)) {
    await saveAttemptProgress(studentId, attemptId, finalResponses);
  }

  // 2. Fetch all questions with answers & all student responses
  const qRows = await query(`
    SELECT 
      aq.question_id,
      aq.marks,
      q.question_type,
      q.marks as default_marks,
      q.negative_marks,
      q.partial_credit,
      q.config_json,
      q.question_text,
      r.response_data
    FROM atelier_attempt_questions aq
    JOIN atelier_questions q ON aq.question_id = q.id
    LEFT JOIN atelier_responses r ON r.attempt_id = aq.attempt_id AND r.question_id = aq.question_id
    WHERE aq.attempt_id = ?
  `, [attemptId]);

  let totalScore = 0;
  let hasPendingManual = false;

  for (const q of qRows) {
    // Options
    const options = await query(`SELECT * FROM atelier_question_options WHERE question_id = ?`, [q.question_id]);
    // Test cases
    const testCases = await query(`SELECT * FROM atelier_question_test_cases WHERE question_id = ?`, [q.question_id]);
    // Rubrics
    const rubrics = await query(`SELECT * FROM atelier_question_rubrics WHERE question_id = ?`, [q.question_id]);

    const questionModel = {
      ...q,
      marks: q.marks,
      options,
      test_cases: testCases,
      rubrics
    };

    const responseVal = q.response_data ? safeJsonParse(q.response_data) : null;

    // Run evaluator
    const evalResult = await evaluateResponse(questionModel, responseVal);

    if (evalResult.status === 'pending_manual_review') {
      hasPendingManual = true;
    }

    const marksAwarded = Number(evalResult.marksAwarded || 0);
    totalScore += marksAwarded;

    // Update response row
    await execute(`
      UPDATE atelier_responses SET
        status = ?,
        marks_awarded = ?,
        max_marks = ?,
        evaluator_feedback = ?
      WHERE attempt_id = ? AND question_id = ?
    `, [
      evalResult.status,
      marksAwarded,
      q.marks,
      evalResult.evaluatorFeedback || '',
      attemptId,
      q.question_id
    ]);
  }

  const finalTotalMarks = attempt.total_marks > 0 ? attempt.total_marks : 1;
  const percentage = Math.max(0, Math.min(100, Math.round((totalScore / finalTotalMarks) * 10000) / 100));
  const passed = totalScore >= attempt.passing_marks ? 1 : 0;
  const finalStatus = hasPendingManual ? 'submitted' : 'evaluated';
  const submittedAt = new Date();

  await execute(`
    UPDATE atelier_attempts SET
      status = ?,
      submitted_at = ?,
      total_score = ?,
      percentage = ?,
      passed = ?
    WHERE id = ?
  `, [finalStatus, submittedAt, totalScore, percentage, passed, attemptId]);

  return {
    success: true,
    attemptId,
    status: finalStatus,
    totalScore,
    totalMarks: finalTotalMarks,
    percentage,
    passed: Boolean(passed),
    hasPendingManualReview: hasPendingManual
  };
}

// ─────────────────────────────────────────────────────────────
// RESULTS, ANALYTICS & MANUAL GRADING
// ─────────────────────────────────────────────────────────────

export async function getAttemptFullResult(attemptId) {
  const [attempt] = await query(`
    SELECT 
      att.*,
      a.title AS assessment_title,
      a.course_id,
      a.passing_marks,
      a.total_marks,
      a.duration_minutes,
      a.show_results_immediately,
      c.title AS course_title,
      s.name AS student_name,
      s.email AS student_email,
      s.avatar AS student_avatar
    FROM atelier_attempts att
    JOIN atelier_assessments a ON att.assessment_id = a.id
    JOIN atelier_courses c ON a.course_id = c.id
    JOIN atelier_students s ON att.student_id = s.id
    WHERE att.id = ? LIMIT 1
  `, [attemptId]);

  if (!attempt) return null;

  // Fetch responses with question snapshot & evaluation
  const responses = await query(`
    SELECT 
      r.*,
      aq.sort_order,
      aq.question_snapshot,
      q.title AS question_title,
      q.question_type,
      q.question_text
    FROM atelier_responses r
    JOIN atelier_attempt_questions aq ON r.attempt_id = aq.attempt_id AND r.question_id = aq.question_id
    JOIN atelier_questions q ON r.question_id = q.id
    WHERE r.attempt_id = ?
    ORDER BY aq.sort_order ASC
  `, [attemptId]);

  // Fetch proctoring audit log
  const proctoringEvents = await query(`
    SELECT * FROM atelier_proctoring_events WHERE attempt_id = ? ORDER BY timestamp ASC
  `, [attemptId]);

  return {
    attempt,
    responses: responses.map(r => ({
      ...r,
      response_data: r.response_data ? safeJsonParse(r.response_data) : null,
      question_snapshot: r.question_snapshot ? safeJsonParse(r.question_snapshot) : null
    })),
    proctoringEvents: proctoringEvents.map(e => ({
      ...e,
      metadata: e.metadata ? safeJsonParse(e.metadata) : null
    }))
  };
}

export async function getAssessmentResultsList(assessmentId) {
  const rows = await query(`
    SELECT 
      att.*,
      s.name AS student_name,
      s.email AS student_email,
      s.avatar AS student_avatar,
      COUNT(CASE WHEN r.status = 'pending_manual_review' THEN 1 END) AS pending_reviews
    FROM atelier_attempts att
    JOIN atelier_students s ON att.student_id = s.id
    LEFT JOIN atelier_responses r ON att.id = r.attempt_id
    WHERE att.assessment_id = ?
    GROUP BY att.id
    ORDER BY att.submitted_at DESC, att.created_at DESC
  `, [assessmentId]);

  return rows;
}

export async function gradeManualResponse({ attemptId, questionId, marksAwarded, feedback, gradedBy }) {
  await execute(`
    UPDATE atelier_responses SET
      marks_awarded = ?,
      evaluator_feedback = ?,
      status = 'evaluated',
      graded_by = ?,
      graded_at = NOW()
    WHERE attempt_id = ? AND question_id = ?
  `, [marksAwarded, feedback || null, gradedBy || null, attemptId, questionId]);

  // Re-calculate attempt total score & check if any pending manual reviews remain
  const [totals] = await query(`
    SELECT 
      SUM(marks_awarded) AS total_score,
      COUNT(CASE WHEN status = 'pending_manual_review' THEN 1 END) AS remaining_pending
    FROM atelier_responses
    WHERE attempt_id = ?
  `, [attemptId]);

  const totalScore = totals?.total_score || 0;
  const remainingPending = totals?.remaining_pending || 0;

  const [attempt] = await query(`
    SELECT a.total_marks, a.passing_marks 
    FROM atelier_attempts att
    JOIN atelier_assessments a ON att.assessment_id = a.id
    WHERE att.id = ? LIMIT 1
  `, [attemptId]);

  const maxTotal = attempt?.total_marks || 1;
  const percentage = Math.round((totalScore / maxTotal) * 10000) / 100;
  const passed = totalScore >= (attempt?.passing_marks || 0) ? 1 : 0;
  const newStatus = remainingPending === 0 ? 'evaluated' : 'submitted';

  await execute(`
    UPDATE atelier_attempts SET
      total_score = ?,
      percentage = ?,
      passed = ?,
      status = ?
    WHERE id = ?
  `, [totalScore, percentage, passed, newStatus, attemptId]);

  return {
    success: true,
    totalScore,
    percentage,
    passed: Boolean(passed),
    status: newStatus
  };
}

// ─────────────────────────────────────────────────────────────
// SAFE UTILITY
// ─────────────────────────────────────────────────────────────

function safeJsonParse(data) {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
