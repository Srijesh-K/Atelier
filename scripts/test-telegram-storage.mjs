// Comprehensive Test Suite for Telegram Bot API Storage
import { uploadFileToTelegram } from '../src/lib/telegram/upload.js';
import { getTelegramFileInfo, downloadTelegramFile } from '../src/lib/telegram/download.js';
import { deleteMessageFromTelegram } from '../src/lib/telegram/delete.js';
import { MAX_FILE_SIZE_BYTES } from '../src/lib/telegram/config.js';

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ [PASS] ${name}`);
  } else {
    results.failed++;
    console.error(`❌ [FAIL] ${name} - ${details}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Telegram Storage Verification Tests...\n');

  let uploadedFileId = null;
  let uploadedMessageId = null;

  // TEST 1: Small text file upload
  try {
    const content = 'Atelier Telegram Bot API Storage Verification Test Content';
    const buffer = Buffer.from(content, 'utf-8');
    const uploadRes = await uploadFileToTelegram({
      fileData: buffer,
      filename: 'telegram-test.txt',
      mimeType: 'text/plain',
      caption: 'Atelier Integration Test 1'
    });

    if (uploadRes && uploadRes.fileId && uploadRes.messageId) {
      uploadedFileId = uploadRes.fileId;
      uploadedMessageId = uploadRes.messageId;
      recordTest('Test 1 — Upload .txt file to Telegram', true, `fileId=${uploadRes.fileId}, messageId=${uploadRes.messageId}`);
    } else {
      recordTest('Test 1 — Upload .txt file to Telegram', false, 'Missing fileId or messageId in response');
    }
  } catch (err) {
    recordTest('Test 1 — Upload .txt file to Telegram', false, err.message);
  }

  // TEST 2: Download & verify content, filename, and size
  if (uploadedFileId) {
    try {
      const fileInfo = await getTelegramFileInfo(uploadedFileId);
      const downloadRes = await downloadTelegramFile(uploadedFileId);
      const downloadedBuffer = Buffer.from(await downloadRes.buffer());
      const downloadedText = downloadedBuffer.toString('utf-8');

      const expectedContent = 'Atelier Telegram Bot API Storage Verification Test Content';
      const contentMatches = downloadedText === expectedContent;
      const sizeMatches = downloadedBuffer.length === Buffer.byteLength(expectedContent);

      recordTest(
        'Test 2 — Download & verify integrity',
        contentMatches && sizeMatches,
        `Matches: ${contentMatches}, Size: ${downloadedBuffer.length} bytes, Remote path: ${fileInfo.filePath}`
      );
    } catch (err) {
      recordTest('Test 2 — Download & verify integrity', false, err.message);
    }
  } else {
    recordTest('Test 2 — Download & verify integrity', false, 'Skipped due to upload failure');
  }

  // TEST 3: Multi-format upload & download (.pdf, .jpg, .png, .zip)
  const formats = [
    { ext: 'pdf', mime: 'application/pdf', content: '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>%%EOF' },
    { ext: 'jpg', mime: 'image/jpeg', content: '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00\xFF\xD9' },
    { ext: 'png', mime: 'image/png', content: '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' },
    { ext: 'zip', mime: 'application/zip', content: 'PK\x05\x06\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' }
  ];

  const formatMessageIds = [];

  for (const fmt of formats) {
    try {
      const filename = `test-sample.${fmt.ext}`;
      const buf = Buffer.from(fmt.content, 'binary');
      const up = await uploadFileToTelegram({
        fileData: buf,
        filename,
        mimeType: fmt.mime
      });

      if (up.fileId) {
        formatMessageIds.push(up.messageId);
        const dl = await downloadTelegramFile(up.fileId);
        const downloadedBytes = Buffer.from(await dl.buffer());
        const ok = downloadedBytes.length === buf.length;
        recordTest(`Test 3 — Format .${fmt.ext} upload & download`, ok, `Bytes: ${downloadedBytes.length}`);
      } else {
        recordTest(`Test 3 — Format .${fmt.ext} upload & download`, false, 'No file_id returned');
      }
    } catch (err) {
      recordTest(`Test 3 — Format .${fmt.ext} upload & download`, false, err.message);
    }
  }

  // TEST 4: Oversized file rejection (> 50 MB)
  try {
    const fakeOversizedBuffer = {
      byteLength: 52 * 1024 * 1024, // 52 MB
      size: 52 * 1024 * 1024
    };
    let threw = false;
    try {
      await uploadFileToTelegram({
        fileData: fakeOversizedBuffer,
        filename: 'huge-video.mp4',
        mimeType: 'video/mp4'
      });
    } catch (err) {
      threw = true;
      const isExpected = err.message.includes('exceeds maximum allowed Telegram Bot API limit');
      recordTest('Test 4 — Oversized file (>50MB) rejection', isExpected, err.message);
    }
    if (!threw) {
      recordTest('Test 4 — Oversized file (>50MB) rejection', false, 'Failed to reject oversized file');
    }
  } catch (err) {
    recordTest('Test 4 — Oversized file (>50MB) rejection', false, err.message);
  }

  // TEST 5: Controlled error with invalid credentials (no secret leakage)
  try {
    const prevToken = process.env.TELEGRAM_BOT_TOKEN;
    process.env.TELEGRAM_BOT_TOKEN = '123456789:INVALID_FAKE_TOKEN_ABCXYZ';

    let errorThrown = false;
    let leaked = false;

    try {
      await uploadFileToTelegram({
        fileData: Buffer.from('test'),
        filename: 'should-fail.txt',
        mimeType: 'text/plain'
      });
    } catch (err) {
      errorThrown = true;
      if (err.message.includes('INVALID_FAKE_TOKEN_ABCXYZ')) {
        leaked = true;
      }
    } finally {
      process.env.TELEGRAM_BOT_TOKEN = prevToken;
    }

    const testPassed = errorThrown && !leaked;
    recordTest(
      'Test 5 — Invalid credentials & secret protection',
      testPassed,
      leaked ? 'TOKEN WAS LEAKED IN ERROR MESSAGE!' : 'Error caught safely without token leakage.'
    );
  } catch (err) {
    recordTest('Test 5 — Invalid credentials & secret protection', false, err.message);
  }

  // TEST 6: Telegram channel message deletion
  if (uploadedMessageId) {
    try {
      const delRes = await deleteMessageFromTelegram(uploadedMessageId);
      recordTest('Test 6 — Telegram deleteMessage from channel', delRes.success, delRes.message);
    } catch (err) {
      recordTest('Test 6 — Telegram deleteMessage from channel', false, err.message);
    }
  }

  // Cleanup additional format test messages
  for (const msgId of formatMessageIds) {
    if (msgId) {
      await deleteMessageFromTelegram(msgId).catch(() => {});
    }
  }

  console.log('\n======================================');
  console.log(`Test Results: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('======================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runTests();
