// Telegram Bot API Client
import https from 'node:https';
import { getTelegramConfig } from './config.js';

/**
 * Sanitizes strings/errors to ensure Telegram Bot Tokens are never leaked in logs or error traces.
 */
export function sanitizeTelegramSecret(text, token) {
  if (!text) return text;
  let str = typeof text === 'string' ? text : (text.message || JSON.stringify(text));
  if (token && str.includes(token)) {
    str = str.replaceAll(token, '[REDACTED_TELEGRAM_TOKEN]');
  }
  return str;
}

/**
 * Execute request against Telegram Bot API with automatic sanitization and SSL compatibility.
 */
export async function telegramFetch(endpointPath, options = {}) {
  const { botToken, apiBase } = getTelegramConfig();
  const url = `${apiBase}/bot${botToken}${endpointPath.startsWith('/') ? '' : '/'}${endpointPath}`;

  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // Windows local certificate interceptor fallback
    if (err?.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || err?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      try {
        return await new Promise(async (resolve, reject) => {
          const parsedUrl = new URL(url);
          const reqHeaders = { ...(options.headers || {}) };

          let reqBody = options.body;
          if (reqBody && typeof reqBody.entries === 'function') {
            // FormData body: convert to Response to read multipart buffer and content-type
            const dummy = new Response(reqBody);
            reqHeaders['content-type'] = dummy.headers.get('content-type');
            reqBody = Buffer.from(await dummy.arrayBuffer());
          }

          const req = https.request({
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: reqHeaders,
            agent: new https.Agent({ rejectUnauthorized: false })
          }, (resStream) => {
            const chunks = [];
            resStream.on('data', chunk => chunks.push(chunk));
            resStream.on('end', () => {
              const fullBuffer = Buffer.concat(chunks);
              const headersObj = {};
              for (const [k, v] of Object.entries(resStream.headers)) {
                if (v !== undefined) headersObj[k] = Array.isArray(v) ? v.join(', ') : v;
              }
              resolve(new Response(fullBuffer, {
                status: resStream.statusCode,
                statusText: resStream.statusMessage,
                headers: headersObj
              }));
            });
          });

          req.on('error', (requestErr) => {
            const safeMsg = sanitizeTelegramSecret(requestErr.message, botToken);
            reject(new Error(`Telegram API connection failed: ${safeMsg}`));
          });

          if (reqBody) {
            if (Buffer.isBuffer(reqBody) || typeof reqBody === 'string') {
              req.write(reqBody);
            }
          }
          req.end();
        });
      } catch (fallbackErr) {
        const safeMsg = sanitizeTelegramSecret(fallbackErr.message, botToken);
        throw new Error(`Telegram API request error: ${safeMsg}`);
      }
    }

    const safeMsg = sanitizeTelegramSecret(err.message, botToken);
    throw new Error(`Telegram network error: ${safeMsg}`);
  }
}

/**
 * Helper to fetch a file binary stream directly from Telegram file storage endpoint.
 */
export async function telegramFileDownload(filePath) {
  const { botToken, apiBase } = getTelegramConfig();
  const fileUrl = `${apiBase}/file/bot${botToken}/${filePath}`;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch file stream from Telegram: HTTP ${res.status}`);
    }
    return res;
  } catch (err) {
    if (err?.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || err?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      return new Promise((resolve, reject) => {
        const parsedUrl = new URL(fileUrl);
        const req = https.request({
          hostname: parsedUrl.hostname,
          port: 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          agent: new https.Agent({ rejectUnauthorized: false })
        }, (resStream) => {
          if (resStream.statusCode >= 400) {
            return reject(new Error(`Telegram file server returned HTTP ${resStream.statusCode}`));
          }
          const chunks = [];
          resStream.on('data', chunk => chunks.push(chunk));
          resStream.on('end', () => {
            const buf = Buffer.concat(chunks);
            resolve(new Response(buf, {
              status: resStream.statusCode,
              headers: resStream.headers
            }));
          });
        });
        req.on('error', (e) => reject(new Error(sanitizeTelegramSecret(e.message, botToken))));
        req.end();
      });
    }
    throw new Error(sanitizeTelegramSecret(err.message, botToken));
  }
}
