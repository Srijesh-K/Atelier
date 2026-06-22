'use server';

import { query, execute, getConnection } from '../utils/db-sql';

// --- STUDENTS ACTIONS ---
export async function getStudents() {
  try {
    const students = await query("SELECT * FROM atelier_students");
    for (const s of students) {
      const enrollments = await query("SELECT course_id FROM atelier_student_courses WHERE student_id = ?", [s.id]);
      s.enrolledCourses = enrollments.map(e => e.course_id);
      // Map database snake_case fields back to frontend camelCase
      s.gradYear = s.grad_year;
      delete s.grad_year;
      s.skills = s.skills ? s.skills.split(',') : [];
    }
    return students;
  } catch (e) {
    console.error("SQL Error in getStudents:", e);
    return [];
  }
}

export async function saveStudent(s) {
  try {
    let exists = null;
    if (s.id) {
      const rows = await query("SELECT id FROM atelier_students WHERE id = ?", [s.id]);
      exists = rows.length > 0 ? rows[0] : null;
    }

    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      const skillsStr = Array.isArray(s.skills) ? s.skills.join(',') : (s.skills || '');

      if (exists) {
        // Update student
        await conn.execute(
          `UPDATE atelier_students SET name = ?, email = ?, phone = ?, college = ?, grad_year = ?, xp = ?, streak = ?, bio = ?, github = ?, linkedin = ?, portfolio = ?, skills = ? WHERE id = ?`,
          [s.name, s.email, s.phone, s.college, s.gradYear || s.grad_year, s.xp || 0, s.streak || 0, s.bio || null, s.github || null, s.linkedin || null, s.portfolio || null, skillsStr || null, s.id]
        );

        // Sync enrollments
        await conn.execute("DELETE FROM atelier_student_courses WHERE student_id = ?", [s.id]);
        if (s.enrolledCourses) {
          for (const cId of s.enrolledCourses) {
            await conn.execute("INSERT INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)", [s.id, cId]);
          }
        }
      } else {
        // Insert student
        const [result] = await conn.execute(
          `INSERT INTO atelier_students (name, email, phone, college, grad_year, xp, streak, password, bio, github, linkedin, portfolio, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.name, s.email, s.phone, s.college, s.gradYear || s.grad_year, s.xp || 0, s.streak || 0, s.password || 'password', s.bio || null, s.github || null, s.linkedin || null, s.portfolio || null, skillsStr || null]
        );

        const newStudentId = result.insertId;
        if (s.enrolledCourses) {
          for (const cId of s.enrolledCourses) {
            await conn.execute("INSERT INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)", [newStudentId, cId]);
          }
        }
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return { success: true };
  } catch (e) {
    console.error("SQL Error in saveStudent:", e);
    throw new Error(e.message);
  }
}

export async function deleteStudent(id) {
  try {
    await execute("DELETE FROM atelier_students WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteStudent:", e);
    throw new Error(e.message);
  }
}

// --- COURSES ACTIONS ---
export async function getCourses() {
  try {
    const courses = await query("SELECT * FROM atelier_courses");
    courses.forEach(c => {
      c.badges = c.badges ? c.badges.split(',') : [];
      c.instructorId = c.instructor_id;
      c.originalPrice = c.original_price;
      c.curriculumOverview = c.curriculum_overview;
      c.totalHours = c.total_hours;
      c.totalModules = c.total_modules;
      c.totalProjects = c.total_projects;
      c.toolsTechnologies = c.tools_technologies;
      c.certificateTitle = c.certificate_title;
      c.courseOutcomes = c.course_outcomes;
      delete c.instructor_id;
      delete c.original_price;
      delete c.curriculum_overview;
      delete c.total_hours;
      delete c.total_modules;
      delete c.total_projects;
      delete c.tools_technologies;
      delete c.certificate_title;
      delete c.course_outcomes;
    });
    return courses;
  } catch (e) {
    console.error("SQL Error in getCourses:", e);
    return [];
  }
}

export async function getCourseById(id) {
  try {
    const rows = await query("SELECT * FROM atelier_courses WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const c = rows[0];
    c.badges = c.badges ? c.badges.split(',') : [];
    c.instructorId = c.instructor_id;
    c.originalPrice = c.original_price;
    c.curriculumOverview = c.curriculum_overview;
    c.totalHours = c.total_hours;
    c.totalModules = c.total_modules;
    c.totalProjects = c.total_projects;
    c.toolsTechnologies = c.tools_technologies;
    c.certificateTitle = c.certificate_title;
    c.courseOutcomes = c.course_outcomes;
    delete c.instructor_id;
    delete c.original_price;
    delete c.curriculum_overview;
    delete c.total_hours;
    delete c.total_modules;
    delete c.total_projects;
    delete c.tools_technologies;
    delete c.certificate_title;
    delete c.course_outcomes;
    return c;
  } catch (e) {
    console.error("SQL Error in getCourseById:", e);
    return null;
  }
}

export async function saveCourse(c) {
  try {
    const badgesStr = Array.isArray(c.badges) ? c.badges.join(',') : (c.badges || '');
    let exists = null;
    if (c.id) {
      const rows = await query("SELECT id FROM atelier_courses WHERE id = ?", [c.id]);
      exists = rows.length > 0 ? rows[0] : null;
    }

    if (exists) {
      await execute(
        `UPDATE atelier_courses SET title = ?, description = ?, image = ?, badges = ?, price = ?, original_price = ?, discount = ?, instructor_id = ?, duration = ?, highlights = ?, curriculum_overview = ?, subtitle = ?, total_hours = ?, total_modules = ?, total_projects = ?, tools_technologies = ?, faqs = ?, certificate_title = ?, course_outcomes = ? WHERE id = ?`,
        [c.title, c.description, c.image, badgesStr, c.price, c.originalPrice || c.original_price, c.discount, c.instructorId || c.instructor_id || null, c.duration || null, c.highlights || null, c.curriculumOverview || c.curriculum_overview || null, c.subtitle || null, c.totalHours || c.total_hours || null, c.totalModules || c.total_modules || null, c.totalProjects || c.total_projects || null, c.toolsTechnologies || c.tools_technologies || null, c.faqs || null, c.certificateTitle || c.certificate_title || null, c.courseOutcomes || c.course_outcomes || null, c.id]
      );
    } else {
      await execute(
        `INSERT INTO atelier_courses (title, description, image, badges, price, original_price, discount, instructor_id, duration, highlights, curriculum_overview, subtitle, total_hours, total_modules, total_projects, tools_technologies, faqs, certificate_title, course_outcomes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.title, c.description, c.image, badgesStr, c.price, c.originalPrice || c.original_price, c.discount, c.instructorId || c.instructor_id || null, c.duration || null, c.highlights || null, c.curriculumOverview || c.curriculum_overview || null, c.subtitle || null, c.totalHours || c.total_hours || null, c.totalModules || c.total_modules || null, c.totalProjects || c.total_projects || null, c.toolsTechnologies || c.tools_technologies || null, c.faqs || null, c.certificateTitle || c.certificate_title || null, c.courseOutcomes || c.course_outcomes || null]
      );
    }
    return { success: true };
  } catch (e) {
    console.error("SQL Error in saveCourse:", e);
    throw new Error(e.message);
  }
}

export async function deleteCourse(id) {
  try {
    await execute("DELETE FROM atelier_courses WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteCourse:", e);
    throw new Error(e.message);
  }
}

// --- LIVE SCHEDULE ACTIONS ---
export async function getSchedule() {
  try {
    const schedule = await query("SELECT * FROM atelier_schedule");
    schedule.forEach(s => {
      s.courseId = s.course_id;
      delete s.course_id;
    });
    return schedule;
  } catch (e) {
    console.error("SQL Error in getSchedule:", e);
    return [];
  }
}

export async function saveSchedule(item) {
  try {
    let exists = null;
    if (item.id) {
      const rows = await query("SELECT id FROM atelier_schedule WHERE id = ?", [item.id]);
      exists = rows.length > 0 ? rows[0] : null;
    }

    if (exists) {
      await execute(
        `UPDATE atelier_schedule SET course_id = ?, time = ?, title = ?, type = ? WHERE id = ?`,
        [item.courseId || item.course_id, item.time, item.title, item.type, item.id]
      );
    } else {
      await execute(
        `INSERT INTO atelier_schedule (course_id, time, title, type) VALUES (?, ?, ?, ?)`,
        [item.courseId || item.course_id, item.time, item.title, item.type]
      );
    }
    return { success: true };
  } catch (e) {
    console.error("SQL Error in saveSchedule:", e);
    throw new Error(e.message);
  }
}

export async function deleteSchedule(id) {
  try {
    await execute("DELETE FROM atelier_schedule WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteSchedule:", e);
    throw new Error(e.message);
  }
}

// --- RECORDINGS ACTIONS ---
export async function getRecordings() {
  try {
    const recordings = await query("SELECT * FROM atelier_recordings");
    recordings.forEach(r => {
      r.courseId = r.course_id;
      delete r.course_id;
    });
    return recordings;
  } catch (e) {
    console.error("SQL Error in getRecordings:", e);
    return [];
  }
}

// --- MATERIALS & ASSETS ACTIONS ---
export async function getMaterials() {
  try {
    const materials = await query("SELECT * FROM atelier_materials");
    for (const m of materials) {
      m.courseId = m.course_id;
      delete m.course_id;

      const assets = await query("SELECT name, size, type FROM atelier_material_assets WHERE material_id = ?", [m.id]);
      m.assets = assets;
    }
    return materials;
  } catch (e) {
    console.error("SQL Error in getMaterials:", e);
    return [];
  }
}

export async function saveMaterial(mat) {
  try {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      let exists = null;
      if (mat.id) {
        const [rows] = await conn.execute("SELECT id FROM atelier_materials WHERE id = ?", [mat.id]);
        exists = rows.length > 0 ? rows[0] : null;
      }

      if (exists) {
        await conn.execute("UPDATE atelier_materials SET course_id = ?, title = ? WHERE id = ?",
          [mat.courseId || mat.course_id, mat.title, mat.id]);

        await conn.execute("DELETE FROM atelier_material_assets WHERE material_id = ?", [mat.id]);
        if (mat.assets) {
          for (const a of mat.assets) {
            await conn.execute("INSERT INTO atelier_material_assets (material_id, name, size, type) VALUES (?, ?, ?, ?)",
              [mat.id, a.name, a.size, a.type]);
          }
        }
      } else {
        const [result] = await conn.execute("INSERT INTO atelier_materials (course_id, title) VALUES (?, ?)",
          [mat.courseId || mat.course_id, mat.title]);

        const newMatId = result.insertId;
        if (mat.assets) {
          for (const a of mat.assets) {
            await conn.execute("INSERT INTO atelier_material_assets (material_id, name, size, type) VALUES (?, ?, ?, ?)",
              [newMatId, a.name, a.size, a.type]);
          }
        }
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return { success: true };
  } catch (e) {
    console.error("SQL Error in saveMaterial:", e);
    throw new Error(e.message);
  }
}

export async function deleteMaterial(id) {
  try {
    await execute("DELETE FROM atelier_materials WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteMaterial:", e);
    throw new Error(e.message);
  }
}

// --- HOTLINE CALLBACKS ACTIONS ---
export async function getCallbacks() {
  try {
    const callbacks = await query("SELECT * FROM atelier_callbacks");
    callbacks.forEach(c => {
      c.studentName = c.student_name;
      delete c.student_name;
    });
    return callbacks;
  } catch (e) {
    console.error("SQL Error in getCallbacks:", e);
    return [];
  }
}

export async function saveCallback(cb) {
  try {
    const timestamp = cb.time || new Date().toISOString();
    await execute(
      `INSERT INTO atelier_callbacks (student_name, phone, topic, time, status) VALUES (?, ?, ?, ?, ?)`,
      [cb.studentName || cb.student_name, cb.phone, cb.topic, timestamp, cb.status || 'Pending']
    );
    return { success: true };
  } catch (e) {
    console.error("SQL Error in saveCallback:", e);
    throw new Error(e.message);
  }
}

export async function resolveCallback(id) {
  try {
    await execute("UPDATE atelier_callbacks SET status = 'Resolved' WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in resolveCallback:", e);
    throw new Error(e.message);
  }
}

export async function deleteCallback(id) {
  try {
    await execute("DELETE FROM atelier_callbacks WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteCallback:", e);
    throw new Error(e.message);
  }
}

// --- LECTURERS ACTIONS ---
export async function getLecturers() {
  try {
    return await query("SELECT * FROM atelier_lecturers");
  } catch (e) {
    console.error("SQL Error in getLecturers:", e);
    return [];
  }
}

export async function saveLecturer(l) {
  try {
    let exists = null;
    if (l.id) {
      const rows = await query("SELECT id FROM atelier_lecturers WHERE id = ?", [l.id]);
      exists = rows.length > 0 ? rows[0] : null;
    }

    if (exists) {
      await execute("UPDATE atelier_lecturers SET name = ?, email = ?, expertise = ?, bio = ? WHERE id = ?",
        [l.name, l.email, l.expertise, l.bio, l.id]);
    } else {
      await execute("INSERT INTO atelier_lecturers (name, email, expertise, bio) VALUES (?, ?, ?, ?)",
        [l.name, l.email, l.expertise, l.bio]);
    }
    return { success: true };
  } catch (e) {
    console.error("SQL Error in saveLecturer:", e);
    throw new Error(e.message);
  }
}

export async function deleteLecturer(id) {
  try {
    await execute("DELETE FROM atelier_lecturers WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteLecturer:", e);
    throw new Error(e.message);
  }
}

// --- TRANSACTIONS ACTIONS ---
export async function getTransactions() {
  try {
    const transactions = await query("SELECT * FROM atelier_transactions");
    transactions.forEach(t => {
      t.studentId = t.student_id;
      t.studentName = t.student_name;
      t.courseId = t.course_id;
      t.courseTitle = t.course_title;
      t.razorpayOrderId = t.razorpay_order_id;
      t.razorpayPaymentId = t.razorpay_payment_id;
      delete t.student_id;
      delete t.student_name;
      delete t.course_id;
      delete t.course_title;
      delete t.razorpay_order_id;
      delete t.razorpay_payment_id;
      delete t.razorpay_signature;
    });
    return transactions;
  } catch (e) {
    console.error("SQL Error in getTransactions:", e);
    return [];
  }
}

export async function deleteTransaction(id) {
  try {
    await execute("DELETE FROM atelier_transactions WHERE id = ?", [id]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in deleteTransaction:", e);
    throw new Error(e.message);
  }
}

// --- COURSE REGISTRATION & TRANSACTIONS JOIN ACTION ---
export async function registerStudentToCourse(studentId, courseId, amount) {
  try {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // Check if already registered
      const [existsRows] = await conn.execute(
        "SELECT student_id FROM atelier_student_courses WHERE student_id = ? AND course_id = ?",
        [studentId, courseId]
      );

      if (existsRows.length === 0) {
        // Map course enrollment
        await conn.execute("INSERT INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)",
          [studentId, courseId]);

        // Fetch student & course details
        const [studentRows] = await conn.execute("SELECT name FROM atelier_students WHERE id = ?", [studentId]);
        const [courseRows] = await conn.execute("SELECT title FROM atelier_courses WHERE id = ?", [courseId]);

        const studentName = studentRows.length > 0 ? studentRows[0].name : 'Unknown Student';
        const courseTitle = courseRows.length > 0 ? courseRows[0].title : 'Unknown Cohort';

        // Log transaction
        await conn.execute(
          `INSERT INTO atelier_transactions (student_id, student_name, course_id, course_title, amount, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, 'Success')`,
          [studentId, studentName, courseId, courseTitle, amount, new Date().toISOString()]
        );
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return { success: true };
  } catch (e) {
    console.error("SQL Error in registerStudentToCourse:", e);
    throw new Error(e.message);
  }
}

// --- AUTHENTICATION & SECURITY ACTIONS ---
export async function authenticateStudent(email, password) {
  try {
    const rows = await query("SELECT * FROM atelier_students WHERE LOWER(email) = LOWER(?)", [email]);
    const student = rows.length > 0 ? rows[0] : null;
    if (student && student.password === password) {
      const enrollments = await query("SELECT course_id FROM atelier_student_courses WHERE student_id = ?", [student.id]);
      student.enrolledCourses = enrollments.map(e => e.course_id);
      student.gradYear = student.grad_year;
      delete student.grad_year;
      student.skills = student.skills ? student.skills.split(',') : [];
      return student;
    }
    return null;
  } catch (e) {
    console.error("SQL Error in authenticateStudent:", e);
    return null;
  }
}

export async function registerStudentAccount(name, email, password, phone, college, gradYear) {
  try {
    const existsRows = await query("SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?)", [email]);
    if (existsRows.length > 0) {
      throw new Error("An account is already registered with this email address.");
    }

    let newStudentId = null;
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // Insert student
      const [result] = await conn.execute(
        `INSERT INTO atelier_students (name, email, password, phone, college, grad_year, xp, streak) VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
        [name, email, password, phone, college, gradYear]
      );

      newStudentId = result.insertId;

      // Enroll by default in Course ID 1 (3.0 Job Ready Cohort)
      await conn.execute("INSERT INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)",
        [newStudentId, 1]);

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    // Retrieve full profile
    const studentRows = await query("SELECT * FROM atelier_students WHERE id = ?", [newStudentId]);
    const student = studentRows[0];
    student.enrolledCourses = [1];
    student.gradYear = student.grad_year;
    delete student.grad_year;
    student.skills = student.skills ? student.skills.split(',') : [];
    return student;
  } catch (e) {
    console.error("SQL Error in registerStudentAccount:", e);
    throw new Error(e.message);
  }
}

export async function updateStudentProfile(id, name, email, phone, college, gradYear, bio, github, linkedin, portfolio, skills) {
  try {
    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
    await execute(
      `UPDATE atelier_students SET name = ?, email = ?, phone = ?, college = ?, grad_year = ?, bio = ?, github = ?, linkedin = ?, portfolio = ?, skills = ? WHERE id = ?`,
      [name, email, phone, college, gradYear, bio || null, github || null, linkedin || null, portfolio || null, skillsStr || null, id]
    );

    // Retrieve full profile
    const studentRows = await query("SELECT * FROM atelier_students WHERE id = ?", [id]);
    const student = studentRows[0];
    const enrollments = await query("SELECT course_id FROM atelier_student_courses WHERE student_id = ?", [id]);
    student.enrolledCourses = enrollments.map(e => e.course_id);
    student.gradYear = student.grad_year;
    delete student.grad_year;
    student.skills = student.skills ? student.skills.split(',') : [];
    return student;
  } catch (e) {
    console.error("SQL Error in updateStudentProfile:", e);
    throw new Error(e.message);
  }
}

export async function resetStudentPassword(email, phone, newPassword) {
  try {
    const rows = await query("SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?) AND phone = ?", [email, phone]);
    if (rows.length === 0) {
      throw new Error("Incorrect security verification: Email or Phone Number does not match our records.");
    }
    await execute("UPDATE atelier_students SET password = ? WHERE LOWER(email) = LOWER(?) AND phone = ?", [newPassword, email, phone]);
    return { success: true };
  } catch (e) {
    console.error("SQL Error in resetStudentPassword:", e);
    throw new Error(e.message);
  }
}

// --- DYNAMIC METRICS / STATISTICS ACTIONS ---
export async function getSiteStats() {
  try {
    const [studentsRow] = await query("SELECT COUNT(*) as count FROM atelier_students");
    const [coursesRow] = await query("SELECT COUNT(*) as count FROM atelier_courses");
    const [scheduleRow] = await query("SELECT COUNT(*) as count FROM atelier_schedule");
    const [pendingRow] = await query("SELECT COUNT(*) as count FROM atelier_callbacks WHERE status = 'Pending'");
    const [lecturersRow] = await query("SELECT COUNT(*) as count FROM atelier_lecturers");
    const [transactionsRow] = await query("SELECT COUNT(*) as count FROM atelier_transactions");

    // Dynamic analytics
    const [activeRow] = await query("SELECT COUNT(DISTINCT student_id) as count FROM atelier_student_courses");
    const [avgRow] = await query("SELECT CAST(AVG(xp) AS UNSIGNED) as avgXp FROM atelier_students");

    return {
      studentsCount: studentsRow.count,
      coursesCount: coursesRow.count,
      scheduleCount: scheduleRow.count,
      pendingCallbacks: pendingRow.count,
      lecturersCount: lecturersRow.count,
      transactionsCount: transactionsRow.count,
      activeEnrolledCount: activeRow.count,
      avgXP: avgRow.avgXp || 0
    };
  } catch (e) {
    console.error("SQL Error in getSiteStats:", e);
    return {
      studentsCount: 0,
      coursesCount: 0,
      scheduleCount: 0,
      pendingCallbacks: 0,
      lecturersCount: 0,
      transactionsCount: 0,
      activeEnrolledCount: 0,
      avgXP: 0
    };
  }
}
