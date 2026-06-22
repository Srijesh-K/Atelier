import mysql from 'mysql2/promise';
import {
  defaultStudents,
  defaultCourses,
  defaultSchedule,
  defaultRecordings,
  defaultMaterials,
  defaultCallbacks,
  defaultLecturers,
  defaultTransactions
} from './db';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'atelier',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let initialized = false;

async function getPool() {
  if (pool) return pool;

  // First, create the database if it doesn't exist
  const tempConn = await mysql.createConnection({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password
  });
  await tempConn.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  await tempConn.end();

  // Now create the pool targeting that database
  pool = mysql.createPool(DB_CONFIG);
  return pool;
}

async function initDb() {
  if (initialized) return;

  const p = await getPool();

  // Create tables
  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_lecturers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      expertise VARCHAR(255),
      bio TEXT
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      image VARCHAR(500),
      badges TEXT,
      price VARCHAR(100),
      original_price VARCHAR(100),
      discount VARCHAR(100),
      instructor_id INT,
      duration VARCHAR(100),
      highlights TEXT,
      curriculum_overview TEXT,
      FOREIGN KEY(instructor_id) REFERENCES atelier_lecturers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  // Ensure new course columns exist on existing tables
  const [courseColumns] = await p.execute("SHOW COLUMNS FROM atelier_courses");
  const courseColNames = courseColumns.map(c => c.Field);
  if (!courseColNames.includes('duration')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN duration VARCHAR(100)");
  }
  if (!courseColNames.includes('highlights')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN highlights TEXT");
  }
  if (!courseColNames.includes('curriculum_overview')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN curriculum_overview TEXT");
  }
  // --- New redesign columns ---
  if (!courseColNames.includes('subtitle')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN subtitle VARCHAR(500)");
  }
  if (!courseColNames.includes('total_hours')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN total_hours VARCHAR(50)");
  }
  if (!courseColNames.includes('total_modules')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN total_modules VARCHAR(50)");
  }
  if (!courseColNames.includes('total_projects')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN total_projects VARCHAR(50)");
  }
  if (!courseColNames.includes('tools_technologies')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN tools_technologies TEXT");
  }
  if (!courseColNames.includes('faqs')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN faqs TEXT");
  }
  if (!courseColNames.includes('certificate_title')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN certificate_title VARCHAR(255)");
  }
  if (!courseColNames.includes('course_outcomes')) {
    await p.execute("ALTER TABLE atelier_courses ADD COLUMN course_outcomes TEXT");
  }

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      college VARCHAR(255),
      grad_year VARCHAR(10),
      xp INT DEFAULT 0,
      streak INT DEFAULT 0,
      password VARCHAR(255) DEFAULT 'password',
      bio TEXT,
      github VARCHAR(500),
      linkedin VARCHAR(500),
      portfolio VARCHAR(500),
      skills TEXT
    ) ENGINE=InnoDB
  `);

  // Ensure columns exist on existing tables
  const [columns] = await p.execute("SHOW COLUMNS FROM atelier_students");
  const columnNames = columns.map(c => c.Field);
  if (!columnNames.includes('bio')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN bio TEXT");
  }
  if (!columnNames.includes('github')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN github VARCHAR(500)");
  }
  if (!columnNames.includes('linkedin')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN linkedin VARCHAR(500)");
  }
  if (!columnNames.includes('portfolio')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN portfolio VARCHAR(500)");
  }
  if (!columnNames.includes('skills')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN skills TEXT");
  }

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_student_courses (
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      PRIMARY KEY (student_id, course_id),
      FOREIGN KEY(student_id) REFERENCES atelier_students(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_schedule (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      time VARCHAR(255),
      title VARCHAR(500),
      type VARCHAR(100),
      FOREIGN KEY(course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_recordings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      title VARCHAR(500),
      date VARCHAR(100),
      image VARCHAR(500),
      FOREIGN KEY(course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      title VARCHAR(500),
      FOREIGN KEY(course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_material_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      material_id INT,
      name VARCHAR(500) NOT NULL,
      size VARCHAR(100),
      type VARCHAR(100),
      FOREIGN KEY(material_id) REFERENCES atelier_materials(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_callbacks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      topic TEXT,
      time VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Pending'
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      student_name VARCHAR(255),
      course_id INT,
      course_title VARCHAR(500),
      amount VARCHAR(100),
      timestamp VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Success',
      razorpay_order_id VARCHAR(255),
      razorpay_payment_id VARCHAR(255),
      razorpay_signature VARCHAR(500),
      FOREIGN KEY(student_id) REFERENCES atelier_students(id) ON DELETE SET NULL,
      FOREIGN KEY(course_id) REFERENCES atelier_courses(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  // Ensure Razorpay columns exist on existing transactions table
  const [txColumns] = await p.execute("SHOW COLUMNS FROM atelier_transactions");
  const txColNames = txColumns.map(c => c.Field);
  if (!txColNames.includes('razorpay_order_id')) {
    await p.execute("ALTER TABLE atelier_transactions ADD COLUMN razorpay_order_id VARCHAR(255)");
  }
  if (!txColNames.includes('razorpay_payment_id')) {
    await p.execute("ALTER TABLE atelier_transactions ADD COLUMN razorpay_payment_id VARCHAR(255)");
  }
  if (!txColNames.includes('razorpay_signature')) {
    await p.execute("ALTER TABLE atelier_transactions ADD COLUMN razorpay_signature VARCHAR(500)");
  }

  // Check if seeding is needed
  const [rows] = await p.execute("SELECT COUNT(*) as count FROM atelier_students");
  const isSeeded = rows[0].count > 0;

  if (!isSeeded) {
    console.log("Seeding MySQL database with default mock templates...");

    // Seed Lecturers
    for (const l of defaultLecturers) {
      await p.execute(
        'INSERT INTO atelier_lecturers (id, name, email, expertise, bio) VALUES (?, ?, ?, ?, ?)',
        [l.id, l.name, l.email, l.expertise, l.bio]
      );
    }

    // Seed Courses
    for (const c of defaultCourses) {
      const badgesStr = c.badges ? c.badges.join(',') : '';
      await p.execute(
        'INSERT INTO atelier_courses (id, title, description, image, badges, price, original_price, discount, instructor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.title, c.description, c.image, badgesStr, c.price, c.originalPrice, c.discount, c.instructorId]
      );
    }

    // Seed Students
    for (const s of defaultStudents) {
      await p.execute(
        'INSERT INTO atelier_students (id, name, email, phone, college, grad_year, xp, streak, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.email, s.phone, s.college, s.gradYear, s.xp, s.streak, 'password']
      );
      if (s.enrolledCourses) {
        for (const courseId of s.enrolledCourses) {
          await p.execute(
            'INSERT INTO atelier_student_courses (student_id, course_id) VALUES (?, ?)',
            [s.id, courseId]
          );
        }
      }
    }

    // Seed Schedule
    for (const sc of defaultSchedule) {
      await p.execute(
        'INSERT INTO atelier_schedule (id, course_id, time, title, type) VALUES (?, ?, ?, ?, ?)',
        [sc.id, sc.courseId, sc.time, sc.title, sc.type]
      );
    }

    // Seed Recordings
    for (const rec of defaultRecordings) {
      await p.execute(
        'INSERT INTO atelier_recordings (id, course_id, title, date, image) VALUES (?, ?, ?, ?, ?)',
        [rec.id, rec.courseId, rec.title, rec.date, rec.image]
      );
    }

    // Seed Materials & Assets
    for (const mat of defaultMaterials) {
      await p.execute(
        'INSERT INTO atelier_materials (id, course_id, title) VALUES (?, ?, ?)',
        [mat.id, mat.courseId, mat.title]
      );
      if (mat.assets) {
        for (const asset of mat.assets) {
          await p.execute(
            'INSERT INTO atelier_material_assets (material_id, name, size, type) VALUES (?, ?, ?, ?)',
            [mat.id, asset.name, asset.size, asset.type]
          );
        }
      }
    }

    // Seed Callbacks
    for (const cb of defaultCallbacks) {
      await p.execute(
        'INSERT INTO atelier_callbacks (id, student_name, phone, topic, time, status) VALUES (?, ?, ?, ?, ?, ?)',
        [cb.id, cb.studentName, cb.phone, cb.topic, cb.time, cb.status]
      );
    }

    // Seed Transactions
    for (const tx of defaultTransactions) {
      await p.execute(
        'INSERT INTO atelier_transactions (id, student_id, student_name, course_id, course_title, amount, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [tx.id, tx.studentId, tx.studentName, tx.courseId, tx.courseTitle, tx.amount, tx.timestamp, tx.status]
      );
    }

    console.log("MySQL database seeded successfully!");
  }

  initialized = true;
}

// Exported query helpers
export async function query(sql, params = []) {
  await initDb();
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  await initDb();
  const p = await getPool();
  const [result] = await p.execute(sql, params);
  return result;
}

export async function getConnection() {
  await initDb();
  const p = await getPool();
  return p.getConnection();
}
