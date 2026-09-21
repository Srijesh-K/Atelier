// Telegram File Download Service
import { telegramFetch, telegramFileDownload, sanitizeTelegramSecret } from './client.js';

/**
 * Resolves file metadata and download path from Telegram using telegram_file_id.
 *
 * @param {string} fileId - Telegram file_id
 * @returns {Promise<{
 *   fileId: string,
 *   fileUniqueId: string,
 *   fileSize: number,
 *   filePath: string
 * }>}
 */
export async function getTelegramFileInfo(fileId) {
  if (!fileId || typeof fileId !== 'string') {
    throw new Error('Telegram file ID is required.');
  }

  const response = await telegramFetch(`/getFile?file_id=${encodeURIComponent(fileId)}`);
  const data = await response.json().catch(() => null);

  if (!response.ok || !data || !data.ok || !data.result) {
    const desc = data?.description || `HTTP ${response.status}`;
    throw new Error(`Failed to resolve Telegram file path: ${sanitizeTelegramSecret(desc)}`);
  }

  return {
    fileId: data.result.file_id,
    fileUniqueId: data.result.file_unique_id,
    fileSize: data.result.file_size,
    filePath: data.result.file_path
  };
}

/**
 * Downloads a file from Telegram storage and returns a streamable Response.
 *
 * @param {string} fileId - Telegram file_id
 * @returns {Promise<{
 *   stream: ReadableStream | null,
 *   buffer: () => Promise<ArrayBuffer>,
 *   size: number,
 *   filePath: string
 * }>}
 */
export async function downloadTelegramFile(fileId) {
  const fileInfo = await getTelegramFileInfo(fileId);

  if (!fileInfo.filePath) {
    throw new Error('Telegram did not return a valid file path for download.');
  }

  const res = await telegramFileDownload(fileInfo.filePath);

  return {
    stream: res.body,
    buffer: () => res.arrayBuffer(),
    size: fileInfo.fileSize,
    filePath: fileInfo.filePath
  };
}
