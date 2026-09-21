// Telegram File Upload Service
import { getTelegramConfig, MAX_FILE_SIZE_BYTES } from './config.js';
import { telegramFetch, sanitizeTelegramSecret } from './client.js';

/**
 * Uploads a document to the configured Telegram private storage channel.
 *
 * @param {Object} params
 * @param {Buffer|Uint8Array|Blob} params.fileData - Raw file bytes or Blob
 * @param {string} params.filename - Original filename
 * @param {string} [params.mimeType] - MIME type of the file
 * @param {string} [params.caption] - Optional document caption
 * @returns {Promise<{
 *   fileId: string,
 *   fileUniqueId: string,
 *   messageId: number,
 *   filename: string,
 *   mimeType: string,
 *   size: number
 * }>}
 */
export async function uploadFileToTelegram({ fileData, filename, mimeType = 'application/octet-stream', caption = '' }) {
  const { storageChatId, maxFileSize } = getTelegramConfig();

  if (!fileData) {
    throw new Error('Upload failed: No file data provided.');
  }

  // Determine size
  let byteLength = 0;
  if (Buffer.isBuffer(fileData) || fileData instanceof Uint8Array) {
    byteLength = fileData.byteLength;
  } else if (typeof fileData.size === 'number') {
    byteLength = fileData.size;
  } else if (fileData instanceof ArrayBuffer) {
    byteLength = fileData.byteLength;
  } else if (typeof fileData.byteLength === 'number') {
    byteLength = fileData.byteLength;
  }

  // Size limit validation
  if (byteLength > maxFileSize) {
    const sizeMb = (byteLength / (1024 * 1024)).toFixed(2);
    const limitMb = (maxFileSize / (1024 * 1024)).toFixed(0);
    throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed Telegram Bot API limit of ${limitMb} MB.`);
  }

  if (byteLength === 0) {
    throw new Error('Upload failed: File is empty (0 bytes).');
  }

  const safeFilename = (filename || 'unnamed_file').replace(/[/\\?%*:|"<>]/g, '_');

  // Prepare FormData
  const formData = new FormData();
  formData.append('chat_id', storageChatId);

  // Convert Buffer to Blob for standard FormData compatibility
  const blob = fileData instanceof Blob 
    ? fileData 
    : new Blob([fileData], { type: mimeType });

  formData.append('document', blob, safeFilename);

  if (caption) {
    formData.append('caption', caption.slice(0, 1024));
  }

  const response = await telegramFetch('/sendDocument', {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || !data.ok) {
    const errDesc = data?.description || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Telegram upload failed: ${sanitizeTelegramSecret(errDesc)}`);
  }

  const result = data.result;
  const doc = result.document;

  if (!doc || !doc.file_id) {
    throw new Error('Telegram upload succeeded but document metadata was missing from response.');
  }

  return {
    fileId: doc.file_id,
    fileUniqueId: doc.file_unique_id,
    messageId: result.message_id,
    filename: doc.file_name || safeFilename,
    mimeType: doc.mime_type || mimeType,
    size: doc.file_size || byteLength
  };
}
