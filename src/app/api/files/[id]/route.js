import { NextResponse } from 'next/server';
import { getFileRecordById, deleteFileRecord, query } from '@/utils/db-sql';
import { downloadTelegramFile } from '@/lib/telegram/download';
import { deleteMessageFromTelegram } from '@/lib/telegram/delete';

export const dynamic = 'force-dynamic';

/**
 * Validates whether the caller has permission to access the specified file record.
 */
async function authorizeAccess(fileRecord, req) {
  // Public categories (profile avatars and course thumbnails) are readable by any authenticated or browsing user
  if (fileRecord.category === 'avatar' || fileRecord.category === 'course') {
    return { authorized: true };
  }

  // Extract auth credentials from headers or query params
  const url = new URL(req.url);
  const userEmail = req.headers.get('x-user-email') || url.searchParams.get('email');
  const adminKey = req.headers.get('x-admin-key') || url.searchParams.get('adminKey');

  // Check admin clearance
  const masterKey = process.env.NEXT_PUBLIC_MASTER_SECURITY_KEY || 'ARSHAD-SAMVRUDHI';
  const passKey = process.env.NEXT_PUBLIC_CLEARANCE_PASSWORD || 'noor';
  if (adminKey && (adminKey === masterKey || adminKey === passKey)) {
    return { authorized: true, isAdmin: true };
  }

  if (!userEmail) {
    return { authorized: false, reason: 'Authentication required. Missing user email or admin clearance.' };
  }

  // Lookup student in database
  const studentRows = await query('SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?)', [userEmail.trim()]);
  if (studentRows.length === 0) {
    return { authorized: false, reason: 'No registered student found matching credentials.' };
  }

  const studentId = studentRows[0].id;

  // If user owns the file
  if (fileRecord.userId && fileRecord.userId === studentId) {
    return { authorized: true, studentId };
  }

  // If file is course material, check enrollment
  if (fileRecord.category === 'material' && fileRecord.courseId) {
    const enrollments = await query(
      'SELECT course_id FROM atelier_student_courses WHERE student_id = ? AND course_id = ?',
      [studentId, fileRecord.courseId]
    );
    if (enrollments.length > 0) {
      return { authorized: true, studentId };
    }
    return { authorized: false, reason: 'You are not enrolled in the course associated with this material.' };
  }

  // If file is not owned by user and not course material
  if (fileRecord.userId && fileRecord.userId !== studentId) {
    return { authorized: false, reason: 'Access denied: You do not have permission to view this file.' };
  }

  return { authorized: true, studentId };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const fileId = parseInt(id, 10);

    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID.' }, { status: 400 });
    }

    const fileRecord = await getFileRecordById(fileId);
    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    // Authorize request
    const auth = await authorizeAccess(fileRecord, request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Access denied.' }, { status: 403 });
    }

    // Fetch file from Telegram
    const telegramFile = await downloadTelegramFile(fileRecord.telegramFileId);

    const url = new URL(request.url);
    const forceDownload = url.searchParams.get('download') === '1';

    // Safe filename encoding for Content-Disposition header
    const rawFilename = fileRecord.filename || 'downloaded_file';
    const encodedFilename = encodeURIComponent(rawFilename).replace(/['()]/g, escape);
    const dispositionType = forceDownload ? 'attachment' : 'inline';
    const contentDisposition = `${dispositionType}; filename="${rawFilename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`;

    const headers = new Headers();
    headers.set('Content-Type', fileRecord.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', contentDisposition);
    if (telegramFile.size) {
      headers.set('Content-Length', String(telegramFile.size));
    }
    headers.set('Cache-Control', 'private, max-age=3600');

    return new Response(telegramFile.stream, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('File download error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error streaming file from storage.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const fileId = parseInt(id, 10);

    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID.' }, { status: 400 });
    }

    const fileRecord = await getFileRecordById(fileId);
    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    // Authorize deletion
    const auth = await authorizeAccess(fileRecord, request);
    if (!auth.authorized || (!auth.isAdmin && auth.studentId !== fileRecord.userId)) {
      return NextResponse.json({ error: 'Unauthorized to delete this file.' }, { status: 403 });
    }

    // Delete message from Telegram storage channel if telegramMessageId is available
    let telegramDeleted = false;
    let telegramMessage = 'No Telegram message_id associated with this record.';
    if (fileRecord.telegramMessageId) {
      const delResult = await deleteMessageFromTelegram(fileRecord.telegramMessageId);
      telegramDeleted = delResult.success;
      telegramMessage = delResult.message;
    }

    // Delete database record
    await deleteFileRecord(fileId);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully.',
      telegramStorageStatus: telegramDeleted ? 'Message deleted from channel' : telegramMessage
    });

  } catch (error) {
    console.error('File delete error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error deleting file.' },
      { status: 500 }
    );
  }
}
