import { NextResponse } from 'next/server';
import { uploadFileToTelegram } from '@/lib/telegram/upload';
import { MAX_FILE_SIZE_BYTES } from '@/lib/telegram/config';
import { createFileRecord, query } from '@/utils/db-sql';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category') || 'general';
    const courseId = formData.get('courseId') ? parseInt(formData.get('courseId'), 10) : null;
    const userEmail = request.headers.get('x-user-email') || formData.get('userEmail') || null;
    const adminKey = request.headers.get('x-admin-key') || formData.get('adminKey') || null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file provided in form-data payload (expected field "file").' },
        { status: 400 }
      );
    }

    // Check size before processing
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          error: `File size exceeds the 50 MB limit supported by Telegram Bot API (received ${sizeMb} MB).`,
          maxAllowedBytes: MAX_FILE_SIZE_BYTES
        },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty (0 bytes).' },
        { status: 400 }
      );
    }

    // Resolve user ownership if userEmail provided
    let userId = null;
    let isAdmin = false;

    // Check admin clearance
    const masterKey = process.env.NEXT_PUBLIC_MASTER_SECURITY_KEY || 'ARSHAD-SAMVRUDHI';
    const passKey = process.env.NEXT_PUBLIC_CLEARANCE_PASSWORD || 'noor';
    if (adminKey && (adminKey === masterKey || adminKey === passKey)) {
      isAdmin = true;
    }

    if (userEmail) {
      const studentRows = await query('SELECT id FROM atelier_students WHERE LOWER(email) = LOWER(?)', [userEmail.trim()]);
      if (studentRows.length > 0) {
        userId = studentRows[0].id;
      }
    }

    // Read bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Telegram Storage Channel
    const telegramResult = await uploadFileToTelegram({
      fileData: buffer,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      caption: `Atelier [${category}] ${file.name}`
    });

    // Save metadata record into database
    const fileRecord = await createFileRecord({
      userId,
      filename: telegramResult.filename,
      telegramFileId: telegramResult.fileId,
      telegramFileUniqueId: telegramResult.fileUniqueId,
      telegramMessageId: telegramResult.messageId,
      mimeType: telegramResult.mimeType,
      size: telegramResult.size,
      category,
      courseId
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size,
        category: fileRecord.category,
        url: `/api/files/${fileRecord.id}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error.message);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
