import mysql from 'mysql2/promise';
import { hashPassword } from './auth';
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
  if (!columnNames.includes('auth_provider')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'credentials'");
  }
  if (!columnNames.includes('avatar')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN avatar VARCHAR(500)");
  }
  if (!columnNames.includes('reset_code')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN reset_code VARCHAR(20)");
  }
  if (!columnNames.includes('reset_code_expires')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN reset_code_expires VARCHAR(100)");
  }
  if (!columnNames.includes('last_active_date')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN last_active_date VARCHAR(50)");
  }
  if (!columnNames.includes('degree')) {
    await p.execute("ALTER TABLE atelier_students ADD COLUMN degree VARCHAR(255)");
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

  // Telegram File Storage Table
  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      filename VARCHAR(500) NOT NULL,
      telegram_file_id VARCHAR(500) NOT NULL,
      telegram_file_unique_id VARCHAR(255) NOT NULL,
      telegram_message_id INT NULL,
      mime_type VARCHAR(255) NOT NULL,
      size INT NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      course_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES atelier_students(id) ON DELETE SET NULL,
      FOREIGN KEY(course_id) REFERENCES atelier_courses(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  // Ensure file_id column exists on atelier_material_assets
  const [matAssetCols] = await p.execute("SHOW COLUMNS FROM atelier_material_assets");
  const matAssetColNames = matAssetCols.map(c => c.Field);
  if (!matAssetColNames.includes('file_id')) {
    await p.execute("ALTER TABLE atelier_material_assets ADD COLUMN file_id INT NULL");
  }
  if (!matAssetColNames.includes('url')) {
    await p.execute("ALTER TABLE atelier_material_assets ADD COLUMN url VARCHAR(500) NULL");
  }

  // ─── MENTOR & LECTURERS TABLE MIGRATIONS ───
  const [lecturerColumns] = await p.execute("SHOW COLUMNS FROM atelier_lecturers");
  const lecturerColNames = lecturerColumns.map(c => c.Field);
  if (!lecturerColNames.includes('password_hash')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN password_hash VARCHAR(255) NULL");
  }
  if (!lecturerColNames.includes('must_change_password')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN must_change_password TINYINT(1) DEFAULT 1");
  }
  if (!lecturerColNames.includes('phone')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN phone VARCHAR(50) NULL");
  }
  if (!lecturerColNames.includes('avatar')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN avatar VARCHAR(500) NULL");
  }
  if (!lecturerColNames.includes('role')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN role VARCHAR(50) DEFAULT 'mentor'");
  }
  if (!lecturerColNames.includes('failed_login_count')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN failed_login_count INT DEFAULT 0");
  }
  if (!lecturerColNames.includes('locked_until')) {
    await p.execute("ALTER TABLE atelier_lecturers ADD COLUMN locked_until TIMESTAMP NULL");
  }

  // One-time backfill default mentor password hash for existing mentors
  try {
    const defaultMentorHash = hashPassword('mentor123');
    await p.execute(
      "UPDATE atelier_lecturers SET password_hash = ?, must_change_password = 1 WHERE password_hash IS NULL OR password_hash = ''",
      [defaultMentorHash]
    );
  } catch (err) {
    console.error("Backfill mentor password hash failed:", err);
  }

  // ─── MENTOR COURSES ASSIGNMENT TABLE ───
  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_mentor_courses (
      mentor_id INT NOT NULL,
      course_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (mentor_id, course_id),
      FOREIGN KEY (mentor_id) REFERENCES atelier_lecturers(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // Backfill mentor courses from existing instructor_id on courses
  try {
    await p.execute(`
      INSERT IGNORE INTO atelier_mentor_courses (mentor_id, course_id)
      SELECT instructor_id, id FROM atelier_courses WHERE instructor_id IS NOT NULL
    `);
  } catch (err) {}

  // ─── LIVE SESSIONS TABLE ───
  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_live_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      mentor_id INT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      scheduled_at DATETIME NOT NULL,
      duration_minutes INT DEFAULT 60,
      meeting_link VARCHAR(500) NOT NULL,
      status ENUM('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
      recording_url VARCHAR(500) NULL,
      started_at TIMESTAMP NULL,
      ended_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id) REFERENCES atelier_lecturers(id) ON DELETE SET NULL,
      INDEX idx_course_status (course_id, status)
    ) ENGINE=InnoDB
  `);

  // ─── NORMALIZED SYLLABUS MODULES & TOPICS ───
  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_course_syllabus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      week_number INT DEFAULT 1,
      module_title VARCHAR(255) NOT NULL,
      description TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_syllabus_topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      syllabus_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (syllabus_id) REFERENCES atelier_course_syllabus(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ─── STUDENT REAL PROGRESS TABLE ───
  await p.execute(`
    CREATE TABLE IF NOT EXISTS atelier_student_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      topic_id INT NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_progress (student_id, course_id, topic_id),
      FOREIGN KEY (topic_id) REFERENCES atelier_syllabus_topics(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES atelier_students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES atelier_courses(id) ON DELETE CASCADE,
      INDEX idx_student_course (student_id, course_id)
    ) ENGINE=InnoDB
  `);

  // Ensure completed_at column on atelier_student_courses
  const [studentCourseCols] = await p.execute("SHOW COLUMNS FROM atelier_student_courses");
  const studentCourseColNames = studentCourseCols.map(c => c.Field);
  if (!studentCourseColNames.includes('completed_at')) {
    await p.execute("ALTER TABLE atelier_student_courses ADD COLUMN completed_at TIMESTAMP NULL");
  }

  // Seed sample syllabus modules & topics if table is empty
  const [syllabusCountRows] = await p.execute("SELECT COUNT(*) as count FROM atelier_course_syllabus");
  if (syllabusCountRows[0].count === 0) {
    const defaultSyllabusData = [
      {
        courseId: 1,
        modules: [
          {
            week: 1,
            title: 'Modern Full-Stack Architecture & Next.js Core',
            desc: 'Foundational mental models of React 19, Turbopack, and Next.js App Router.',
            topics: ['React Server Components vs Client Boundaries', 'Streaming SSR & Suspense Architecture', 'Server Actions & Form Handling', 'Routing & Layout Shell Engineering']
          },
          {
            week: 2,
            title: 'Database Engineering & Relational Modeling',
            desc: 'Designing production schemas, normalization, and ACID transactions.',
            topics: ['Relational Schema Design & Constraints', 'Connection Pooling & Query Optimization', 'Database Migrations & Idempotency', 'Indexing Strategies & B-Trees']
          },
          {
            week: 3,
            title: 'API Infrastructure & External Integrations',
            desc: 'Building resilient API layers, payment processing, and messaging gateways.',
            topics: ['REST & RPC API Design Principles', 'Webhook Handling & Cryptographic Verification', 'Telegram Bot API Storage Integration', 'Payment Processing with Razorpay']
          },
          {
            week: 4,
            title: 'Production Deployment & Observability',
            desc: 'Containerization, performance monitoring, and CI/CD pipelines.',
            topics: ['Docker Multi-stage Builds', 'Caching Strategies & CDN Delivery', 'Structured Error Logging & Health Probes', 'Zero-Downtime Deployment']
          }
        ]
      },
      {
        courseId: 2,
        modules: [
          {
            week: 1,
            title: 'High-Availability Load Balancing & Proxies',
            desc: 'Configuring reverse proxies, SSL termination, and health checks.',
            topics: ['Reverse Proxies & Nginx Configuration', 'Least-Connection & Round-Robin Algorithms', 'Layer 4 vs Layer 7 Routing', 'Rate Limiting & DDoS Mitigation']
          },
          {
            week: 2,
            title: 'Horizontal Database Partitioning & Sharding',
            desc: 'Partition keys, consistent hashing rings, and cross-shard queries.',
            topics: ['Consistent Hashing Implementation', 'Range & Hash-Based Partitioning', 'Primary-Replica Replication Lag', 'Distributed Locks & Two-Phase Commit']
          },
          {
            week: 3,
            title: 'Distributed In-Memory Caching (Redis)',
            desc: 'Cache invalidation, read-through, and cache stampede protection.',
            topics: ['Cache Patterns (Cache-Aside, Write-Through)', 'Redis Data Structures & Memory Policies', 'Thundering Herd & Cache Stampede Solutions', 'Cache Eviction Algorithms (LRU/LFU)']
          },
          {
            week: 4,
            title: 'Asynchronous Event-Driven Messaging (Kafka/RabbitMQ)',
            desc: 'Message brokers, consumer groups, and idempotency in queues.',
            topics: ['Publish-Subscribe vs Message Queue Patterns', 'Consumer Groups & Partition Rebalancing', 'Dead Letter Queues & Retry Strategies', 'Event Sourcing & CQRS Architecture']
          }
        ]
      },
      {
        courseId: 3,
        modules: [
          {
            week: 1,
            title: 'LLM Foundations, Embeddings & Vector Stores',
            desc: 'Understanding tokenization, embedding spaces, and approximate nearest neighbors.',
            topics: ['Transformer Architecture & Attention Mechanisms', 'Generating High-Dimensional Embeddings', 'Vector Indices (HNSW, IVFFlat)', 'Similarity Metrics (Cosine, Euclidean)']
          },
          {
            week: 2,
            title: 'Retrieval Augmented Generation (RAG) Systems',
            desc: 'Chunking strategies, hybrid search, and context window optimization.',
            topics: ['Document Chunking & Metadata Filtering', 'Hybrid Dense-Sparse Keyword Search', 'Re-ranking & Context Relevance Optimization', 'RAG Evaluation & Hallucination Detection']
          },
          {
            week: 3,
            title: 'Autonomous Tool-Augmented Agents',
            desc: 'Tool execution loops, ReAct prompting, and agent state machines.',
            topics: ['ReAct Prompting & Decision Loops', 'Function Calling & Schema Validation', 'Multi-Agent Collaboration Networks', 'Memory & Conversation State Persistence']
          }
        ]
      }
    ];

    for (const syllabusGroup of defaultSyllabusData) {
      for (let mIdx = 0; mIdx < syllabusGroup.modules.length; mIdx++) {
        const mod = syllabusGroup.modules[mIdx];
        const [modRes] = await p.execute(
          `INSERT INTO atelier_course_syllabus (course_id, week_number, module_title, description, sort_order) VALUES (?, ?, ?, ?, ?)`,
          [syllabusGroup.courseId, mod.week, mod.title, mod.desc, mIdx + 1]
        );
        const syllabusId = modRes.insertId;

        for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
          await p.execute(
            `INSERT INTO atelier_syllabus_topics (syllabus_id, title, sort_order) VALUES (?, ?, ?)`,
            [syllabusId, mod.topics[tIdx], tIdx + 1]
          );
        }
      }
    }
  }

  // Seed sample live sessions if empty
  const [liveCountRows] = await p.execute("SELECT COUNT(*) as count FROM atelier_live_sessions");
  if (liveCountRows[0].count === 0) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 19).replace('T', ' ');

    await p.execute(
      `INSERT INTO atelier_live_sessions (course_id, mentor_id, title, description, scheduled_at, duration_minutes, meeting_link, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        1,
        'Live Cohort Code Review: Server Actions & Next.js Patterns',
        'Interactive architectural walkthrough reviewing student project submissions and best practices.',
        tomorrowStr,
        75,
        'https://meet.google.com/qwe-rtyu-iop',
        'scheduled'
      ]
    );

    await p.execute(
      `INSERT INTO atelier_live_sessions (course_id, mentor_id, title, description, scheduled_at, duration_minutes, meeting_link, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        2,
        1,
        'System Architecture Masterclass: Database Partitioning & Sharding',
        'Hands-on live laboratory designing consistent hashing rings and sharding routers under high concurrency.',
        tomorrowStr,
        90,
        'https://meet.google.com/asd-fghj-klz',
        'scheduled'
      ]
    );
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

// --- FILE STORAGE HELPERS ---
export async function createFileRecord({ userId, filename, telegramFileId, telegramFileUniqueId, telegramMessageId, mimeType, size, category = 'general', courseId = null }) {
  await initDb();
  const p = await getPool();
  const [result] = await p.execute(
    `INSERT INTO atelier_files (user_id, filename, telegram_file_id, telegram_file_unique_id, telegram_message_id, mime_type, size, category, course_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId || null, filename, telegramFileId, telegramFileUniqueId, telegramMessageId || null, mimeType, size, category, courseId || null]
  );
  return {
    id: result.insertId,
    userId,
    filename,
    telegramFileId,
    telegramFileUniqueId,
    telegramMessageId,
    mimeType,
    size,
    category,
    courseId
  };
}

export async function getFileRecordById(id) {
  await initDb();
  const p = await getPool();
  const [rows] = await p.execute('SELECT * FROM atelier_files WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    filename: r.filename,
    telegramFileId: r.telegram_file_id,
    telegramFileUniqueId: r.telegram_file_unique_id,
    telegramMessageId: r.telegram_message_id,
    mimeType: r.mime_type,
    size: r.size,
    category: r.category,
    courseId: r.course_id,
    createdAt: r.created_at
  };
}

export async function deleteFileRecord(id) {
  await initDb();
  const p = await getPool();
  const [result] = await p.execute('DELETE FROM atelier_files WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getFilesForUser(userId) {
  await initDb();
  const p = await getPool();
  const [rows] = await p.execute('SELECT * FROM atelier_files WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    filename: r.filename,
    telegramFileId: r.telegram_file_id,
    telegramFileUniqueId: r.telegram_file_unique_id,
    telegramMessageId: r.telegram_message_id,
    mimeType: r.mime_type,
    size: r.size,
    category: r.category,
    courseId: r.course_id,
    createdAt: r.created_at
  }));
}
