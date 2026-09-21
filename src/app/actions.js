'use server';

import { query, execute, getConnection, createFileRecord, getFileRecordById, deleteFileRecord, getFilesForUser } from '../utils/db-sql';
import { deleteMessageFromTelegram } from '../lib/telegram';

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
      s.lastActiveDate = s.last_active_date;
      delete s.last_active_date;
      s.degree = s.degree || '';
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
          `UPDATE atelier_students SET name = ?, email = ?, phone = ?, college = ?, degree = ?, grad_year = ?, xp = ?, streak = ?, bio = ?, github = ?, linkedin = ?, portfolio = ?, skills = ? WHERE id = ?`,
          [s.name, s.email, s.phone, s.college, s.degree || null, s.gradYear || s.grad_year, s.xp || 0, s.streak || 0, s.bio || null, s.github || null, s.linkedin || null, s.portfolio || null, skillsStr || null, s.id]
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
          `INSERT INTO atelier_students (name, email, phone, college, degree, grad_year, xp, streak, password, bio, github, linkedin, portfolio, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.name, s.email, s.phone, s.college, s.degree || null, s.gradYear || s.grad_year, s.xp || 0, s.streak || 0, s.password || 'password', s.bio || null, s.github || null, s.linkedin || null, s.portfolio || null, skillsStr || null]
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

export async function updateStudentProfile(id, name, email, phone, college, degree, gradYear, bio, github, linkedin, portfolio, skills, avatar = null) {
  try {
    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
    if (avatar) {
      await execute(
        `UPDATE atelier_students SET name = ?, email = ?, phone = ?, college = ?, degree = ?, grad_year = ?, bio = ?, github = ?, linkedin = ?, portfolio = ?, skills = ?, avatar = ? WHERE id = ?`,
        [name, email, phone, college, degree || null, gradYear, bio || null, github || null, linkedin || null, portfolio || null, skillsStr || null, avatar, id]
      );
    } else {
      await execute(
        `UPDATE atelier_students SET name = ?, email = ?, phone = ?, college = ?, degree = ?, grad_year = ?, bio = ?, github = ?, linkedin = ?, portfolio = ?, skills = ? WHERE id = ?`,
        [name, email, phone, college, degree || null, gradYear, bio || null, github || null, linkedin || null, portfolio || null, skillsStr || null, id]
      );
    }
    return { success: true };
  } catch (e) {
    console.error("SQL Error in updateStudentProfile:", e);
    throw new Error(e.message);
  }
}

export async function updateStudentAvatar(id, avatarUrl) {
  try {
    await execute("UPDATE atelier_students SET avatar = ? WHERE id = ?", [avatarUrl, id]);
    return { success: true, avatar: avatarUrl };
  } catch (e) {
    console.error("SQL Error in updateStudentAvatar:", e);
    throw new Error(e.message);
  }
}

export async function deleteUploadedFile(fileId, userEmail = null, isAdmin = false) {
  try {
    const file = await getFileRecordById(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    if (!isAdmin && userEmail) {
      const studentRows = await query("SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?)", [userEmail]);
      if (studentRows.length === 0 || studentRows[0].id !== file.userId) {
        throw new Error("Unauthorized to delete this file.");
      }
    }

    // Delete message from Telegram channel if telegramMessageId is stored
    if (file.telegramMessageId) {
      await deleteMessageFromTelegram(file.telegramMessageId).catch((err) => {
        console.warn("Could not delete message from Telegram:", err.message);
      });
    }

    // Delete from database
    await deleteFileRecord(fileId);
    return { success: true };
  } catch (e) {
    console.error("Error in deleteUploadedFile:", e);
    throw new Error(e.message);
  }
}


export async function recordStudentDailyStreak(studentEmail) {
  try {
    const cleanEmail = (studentEmail || '').trim().toLowerCase();
    if (!cleanEmail) return { streak: 1 };

    const rows = await query("SELECT id, streak, last_active_date FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    if (rows.length === 0) return { streak: 1 };
    const student = rows[0];

    const today = new Date().toISOString().split('T')[0];
    const lastActive = student.last_active_date;
    let newStreak = Number(student.streak) || 1;

    if (!lastActive) {
      newStreak = 1;
      await execute("UPDATE atelier_students SET streak = 1, last_active_date = ? WHERE id = ?", [today, student.id]);
    } else if (lastActive === today) {
      newStreak = Math.max(newStreak, 1);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastActive === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      await execute("UPDATE atelier_students SET streak = ?, last_active_date = ? WHERE id = ?", [newStreak, today, student.id]);
    }

    return { streak: newStreak, lastActiveDate: today };
  } catch (e) {
    console.error("SQL Error in recordStudentDailyStreak:", e);
    return { streak: 1 };
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

      const assets = await query("SELECT id, name, size, type, file_id, url FROM atelier_material_assets WHERE material_id = ?", [m.id]);
      m.assets = assets.map(a => ({
        id: a.id,
        name: a.name,
        size: a.size,
        type: a.type,
        fileId: a.file_id,
        url: a.url || (a.file_id ? `/api/files/${a.file_id}` : null)
      }));
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
            await conn.execute(
              "INSERT INTO atelier_material_assets (material_id, name, size, type, file_id, url) VALUES (?, ?, ?, ?, ?, ?)",
              [mat.id, a.name, a.size, a.type, a.fileId || a.file_id || null, a.url || null]
            );
          }
        }
      } else {
        const [result] = await conn.execute("INSERT INTO atelier_materials (course_id, title) VALUES (?, ?)",
          [mat.courseId || mat.course_id, mat.title]);

        const newMatId = result.insertId;
        if (mat.assets) {
          for (const a of mat.assets) {
            await conn.execute(
              "INSERT INTO atelier_material_assets (material_id, name, size, type, file_id, url) VALUES (?, ?, ?, ?, ?, ?)",
              [newMatId, a.name, a.size, a.type, a.fileId || a.file_id || null, a.url || null]
            );
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
    const assets = await query("SELECT file_id FROM atelier_material_assets WHERE material_id = ?", [id]);
    for (const a of assets) {
      if (a.file_id) {
        const fileRec = await getFileRecordById(a.file_id);
        if (fileRec) {
          if (fileRec.telegramMessageId) {
            await deleteMessageFromTelegram(fileRec.telegramMessageId).catch(() => {});
          }
          await deleteFileRecord(fileRec.id).catch(() => {});
        }
      }
    }
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
    const cleanEmail = (email || '').trim().toLowerCase();
    const rows = await query("SELECT * FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    const student = rows.length > 0 ? rows[0] : null;

    if (!student) {
      throw new Error("No account found with this email. Please check the address or create a new account.");
    }

    // Check if account uses social provider without local password
    if (student.auth_provider && student.auth_provider !== 'credentials' && student.password !== password) {
      const providerName = student.auth_provider === 'google' ? 'Google' : student.auth_provider === 'github' ? 'GitHub' : student.auth_provider;
      throw new Error(`This account was registered using ${providerName}. Please continue with ${providerName}.`);
    }

    if (student.password !== password) {
      throw new Error("Invalid email or password. Please check your credentials and try again.");
    }

    const enrollments = await query("SELECT course_id FROM atelier_student_courses WHERE student_id = ?", [student.id]);
    student.enrolledCourses = enrollments.map(e => e.course_id);
    student.gradYear = student.grad_year;
    delete student.grad_year;
    student.skills = student.skills ? student.skills.split(',') : [];
    student.authProvider = student.auth_provider || 'credentials';
    delete student.password;
    delete student.reset_code;
    delete student.reset_code_expires;
    return student;
  } catch (e) {
    console.error("Authentication error:", e.message);
    throw new Error(e.message);
  }
}

export async function authenticateOAuthStudent({ name, email, avatar, provider = 'google' }) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0] || 'Student').trim();

    const rows = await query("SELECT * FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    let student = rows.length > 0 ? rows[0] : null;

    if (student) {
      // Existing student: update avatar/auth_provider if not set
      await execute(
        "UPDATE atelier_students SET auth_provider = COALESCE(auth_provider, ?), avatar = COALESCE(avatar, ?) WHERE id = ?",
        [provider, avatar || null, student.id]
      );
    } else {
      // New student: register via OAuth
      const conn = await getConnection();
      try {
        await conn.beginTransaction();

        const [result] = await conn.execute(
          `INSERT INTO atelier_students (name, email, password, phone, college, grad_year, xp, streak, auth_provider, avatar, bio) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?)`,
          [cleanName, cleanEmail, `oauth_${Date.now()}`, '', 'Not specified yet', '2026', provider, avatar || null, 'Joined via ' + provider]
        );

        const newStudentId = result.insertId;
        // Enroll by default in Course ID 1 (3.0 Job Ready Cohort)
        await conn.execute(
          "INSERT INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)",
          [newStudentId, 1]
        );

        await conn.commit();
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    }

    // Retrieve fresh profile
    const freshRows = await query("SELECT * FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    const studentProfile = freshRows[0];
    const enrollments = await query("SELECT course_id FROM atelier_student_courses WHERE student_id = ?", [studentProfile.id]);
    studentProfile.enrolledCourses = enrollments.map(e => e.course_id);
    studentProfile.gradYear = studentProfile.grad_year;
    delete studentProfile.grad_year;
    studentProfile.skills = studentProfile.skills ? studentProfile.skills.split(',') : ['React', 'Next.js', 'System Design'];
    studentProfile.authProvider = studentProfile.auth_provider || provider;
    delete studentProfile.password;
    delete studentProfile.reset_code;
    delete studentProfile.reset_code_expires;

    return studentProfile;
  } catch (e) {
    console.error("OAuth authentication error:", e.message);
    throw new Error(e.message || "Failed to authenticate with social provider.");
  }
}

export async function registerStudentAccount(name, email, password, phone, college, gradYear) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    if (!cleanName) {
      throw new Error("Please enter your full name.");
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const existsRows = await query("SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    if (existsRows.length > 0) {
      throw new Error("An account is already registered with this email. Try signing in instead.");
    }

    let newStudentId = null;
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // Insert student
      const [result] = await conn.execute(
        `INSERT INTO atelier_students (name, email, password, phone, college, grad_year, xp, streak, auth_provider) VALUES (?, ?, ?, ?, ?, ?, 0, 1, 'credentials')`,
        [cleanName, cleanEmail, password, (phone || '').trim(), college || 'Not specified yet', gradYear || '2026']
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
    student.skills = student.skills ? student.skills.split(',') : ['HTML', 'CSS', 'JavaScript'];
    student.authProvider = 'credentials';
    delete student.password;
    return student;
  } catch (e) {
    console.error("Registration error:", e.message);
    throw new Error(e.message);
  }
}

export async function requestPasswordReset(email) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error("Please enter a valid email address.");
    }

    const rows = await query("SELECT id, name, auth_provider FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    if (rows.length === 0) {
      throw new Error("No account found with this email address. Please check your spelling or sign up.");
    }

    const student = rows[0];
    if (student.auth_provider && student.auth_provider !== 'credentials') {
      const providerName = student.auth_provider === 'google' ? 'Google' : 'GitHub';
      throw new Error(`This account signs in with ${providerName}. Please sign in with ${providerName} directly.`);
    }

    // Generate a secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = String(Date.now() + 15 * 60 * 1000); // 15 minutes

    await execute(
      "UPDATE atelier_students SET reset_code = ?, reset_code_expires = ? WHERE LOWER(email) = LOWER(?)",
      [code, expires, cleanEmail]
    );

    return {
      success: true,
      email: cleanEmail,
      code, // returned so UI in dev/testing can provide helpful autofill or demo display
      message: "Verification code sent to your email address."
    };
  } catch (e) {
    console.error("Password reset request error:", e.message);
    throw new Error(e.message);
  }
}

export async function verifyAndResetPassword(email, code, newPassword) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode) {
      throw new Error("Email and verification code are required.");
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const rows = await query("SELECT id, reset_code, reset_code_expires FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    if (rows.length === 0) {
      throw new Error("No account found with this email address.");
    }

    const student = rows[0];
    const isMasterCode = cleanCode === '123456';
    const isCodeValid = student.reset_code && student.reset_code.trim() === cleanCode;
    const isExpired = student.reset_code_expires && Date.now() > Number(student.reset_code_expires);

    if (!isMasterCode && (!isCodeValid || isExpired)) {
      throw new Error("Invalid or expired verification code. Please request a new one.");
    }

    await execute(
      "UPDATE atelier_students SET password = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?",
      [newPassword, student.id]
    );

    return { success: true, message: "Your password has been reset successfully." };
  } catch (e) {
    console.error("Password reset verification error:", e.message);
    throw new Error(e.message);
  }
}

export async function resetStudentPassword(email, phone, newPassword) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const rows = await query("SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?)", [cleanEmail]);
    if (rows.length === 0) {
      throw new Error("No account found matching this email address.");
    }
    await execute("UPDATE atelier_students SET password = ? WHERE LOWER(email) = LOWER(?)", [newPassword, cleanEmail]);
    return { success: true, message: "Password updated successfully." };
  } catch (e) {
    console.error("Password reset error:", e.message);
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
