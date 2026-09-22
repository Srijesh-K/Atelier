import crypto from 'crypto';
import { query } from './db-sql';

const AUTH_SECRET = process.env.SESSION_SECRET || 'atelier-mentor-jwt-signing-secret-2026';

/**
 * Hash a password securely using scrypt with random salt
 * Output format: scrypt:<salt>:<hash>
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a candidate password against stored scrypt hash
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      // Fallback for legacy plain text passwords if any
      return password === storedHash;
    }
    const [, salt, originalHash] = parts;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const originalBuffer = Buffer.from(originalHash, 'hex');
    if (derivedKey.length !== originalBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, originalBuffer);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Generate a random readable temporary password
 */
export function generateTempPassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let pass = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

/**
 * Sign a session token for mentor authentication
 */
export function signMentorSession(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    role: 'mentor',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify signed session token
 */
export function verifyMentorSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null; // Expired
    }
    if (parsed.role !== 'mentor') {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

/**
 * Sign a session token for admin console
 */
export function signAdminSession(payload = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    role: 'admin',
    exp: Date.now() + 12 * 60 * 60 * 1000 // 12 hours
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify signed admin session token
 */
export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null; // Expired
    }
    if (parsed.role !== 'admin') {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

/**
 * Check if mentor account is currently locked out
 */
export function isMentorLocked(mentor) {
  if (!mentor || !mentor.locked_until) return false;
  const lockTime = new Date(mentor.locked_until).getTime();
  const now = Date.now();
  if (lockTime > now) {
    const remainingMinutes = Math.ceil((lockTime - now) / (60 * 1000));
    return { locked: true, remainingMinutes };
  }
  return false;
}

/**
 * Assert that mentor owns or is assigned to a course
 * Grants access if assigned in atelier_mentor_courses, or set as course instructor_id,
 * or if mentor is an admin or single lecturer on the platform.
 */
export async function assertMentorOwnsCourse(mentorId, courseId) {
  if (!mentorId || !courseId) {
    throw new Error('Unauthorized: missing mentor or course identifier.');
  }

  try {
    // 1. Check if user is an admin lecturer
    const mentorRows = await query(
      `SELECT id, name, role FROM atelier_lecturers WHERE id = ? LIMIT 1`,
      [mentorId]
    );
    if (mentorRows.length > 0 && mentorRows[0].role === 'admin') {
      return true; // Administrator has universal cohort access
    }

    // 2. Check atelier_mentor_courses assignment table
    const rows = await query(
      `SELECT 1 FROM atelier_mentor_courses WHERE mentor_id = ? AND course_id = ? LIMIT 1`,
      [mentorId, courseId]
    );
    if (rows.length > 0) return true;

    // 3. Check if course has instructor_id set to this mentor
    const legacy = await query(
      `SELECT 1 FROM atelier_courses WHERE id = ? AND instructor_id = ? LIMIT 1`,
      [courseId, mentorId]
    );
    if (legacy.length > 0) {
      try {
        await query(
          `INSERT IGNORE INTO atelier_mentor_courses (mentor_id, course_id) VALUES (?, ?)`,
          [mentorId, courseId]
        );
      } catch (e) {}
      return true;
    }

    // 4. Check if course has instructor name matching mentor name
    if (mentorRows.length > 0 && mentorRows[0].name) {
      const nameMatch = await query(
        `SELECT id FROM atelier_courses WHERE id = ? AND (instructor = ? OR title LIKE ?) LIMIT 1`,
        [courseId, mentorRows[0].name, `%${mentorRows[0].name}%`]
      ).catch(() => []);
      if (nameMatch.length > 0) {
        try {
          await query(
            `INSERT IGNORE INTO atelier_mentor_courses (mentor_id, course_id) VALUES (?, ?)`,
            [mentorId, courseId]
          );
        } catch (e) {}
        return true;
      }
    }

    // 5. If this is the only lecturer registered in the platform, grant access
    const allLecturers = await query(`SELECT COUNT(*) as count FROM atelier_lecturers`);
    if (allLecturers?.[0]?.count === 1) {
      try {
        await query(
          `INSERT IGNORE INTO atelier_mentor_courses (mentor_id, course_id) VALUES (?, ?)`,
          [mentorId, courseId]
        );
      } catch (e) {}
      return true;
    }
  } catch (dbErr) {
    console.error("Error asserting mentor ownership:", dbErr);
  }

  throw new Error(`Unauthorized: Mentor #${mentorId} does not have access to Course #${courseId}.`);
}
