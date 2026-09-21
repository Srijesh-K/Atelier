// Telegram Storage Configuration

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB limit per Telegram Bot API
export const TELEGRAM_API_BASE = 'https://api.telegram.org';

export function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const storageChatId = process.env.TELEGRAM_STORAGE_CHAT_ID;

  if (!botToken || !botToken.trim()) {
    throw new Error('Telegram Bot Token is not configured. Please define TELEGRAM_BOT_TOKEN in environment variables.');
  }

  if (!storageChatId || !String(storageChatId).trim()) {
    throw new Error('Telegram Storage Chat ID is not configured. Please define TELEGRAM_STORAGE_CHAT_ID in environment variables.');
  }

  return {
    botToken: botToken.trim(),
    storageChatId: String(storageChatId).trim(),
    apiBase: TELEGRAM_API_BASE,
    maxFileSize: MAX_FILE_SIZE_BYTES
  };
}
