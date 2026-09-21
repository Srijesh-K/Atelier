// Telegram File Deletion Service
import { getTelegramConfig } from './config.js';
import { telegramFetch, sanitizeTelegramSecret } from './client.js';

/**
 * Deletes the message containing the file from the Telegram storage channel.
 *
 * @param {number|string} messageId - The Telegram message_id in the storage channel
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function deleteMessageFromTelegram(messageId) {
  if (!messageId) {
    return {
      success: false,
      message: 'No Telegram message_id provided. File reference will only be removed from database.'
    };
  }

  const { storageChatId } = getTelegramConfig();

  try {
    const res = await telegramFetch(`/deleteMessage?chat_id=${encodeURIComponent(storageChatId)}&message_id=${encodeURIComponent(messageId)}`);
    const data = await res.json().catch(() => null);

    if (res.ok && data?.ok) {
      return {
        success: true,
        message: 'File message deleted from Telegram storage channel.'
      };
    }

    const desc = data?.description || `HTTP ${res.status}`;
    // Common error: message already deleted or too old
    return {
      success: false,
      message: `Telegram deleteMessage warning: ${sanitizeTelegramSecret(desc)}`
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to delete file from Telegram channel: ${err.message}`
    };
  }
}
