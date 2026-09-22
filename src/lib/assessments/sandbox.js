import vm from 'node:vm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Safely executes JavaScript code in an isolated V8 Virtual Machine context.
 */
export async function executeJavaScript(code, input = null, timeLimitMs = 3000) {
  const startTime = Date.now();
  const stdoutLogs = [];

  const sandbox = {
    console: {
      log: (...args) => stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      warn: (...args) => stdoutLogs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
      error: (...args) => stdoutLogs.push('[ERROR] ' + args.map(a => String(a)).join(' '))
    },
    Math,
    Date,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Set,
    Map,
    RegExp
  };

  try {
    const context = vm.createContext(sandbox);

    let runnerScript = code;
    // If input is provided as JSON object containing args, attempt to invoke the defined function
    if (input) {
      let parsedInput = null;
      try {
        parsedInput = typeof input === 'string' ? JSON.parse(input) : input;
      } catch {
        parsedInput = input;
      }

      if (parsedInput && Array.isArray(parsedInput.args)) {
        // Find function name if declared (e.g., function twoSum or const twoSum =)
        const funcMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/) || 
                          code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
        if (funcMatch && funcMatch[1]) {
          const funcName = funcMatch[1];
          const serializedArgs = JSON.stringify(parsedInput.args);
          runnerScript += `\n;__result__ = ${funcName}(...${serializedArgs});`;
        }
      }
    }

    const script = new vm.Script(runnerScript);
    const executionPromise = new Promise((resolve, reject) => {
      try {
        script.runInContext(context, {
          timeout: timeLimitMs,
          displayErrors: true
        });
        resolve(context.__result__);
      } catch (err) {
        reject(err);
      }
    });

    const result = await executionPromise;
    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      result: result !== undefined ? result : null,
      stdout: stdoutLogs.join('\n'),
      stderr: '',
      executionTimeMs
    };
  } catch (err) {
    return {
      success: false,
      result: null,
      stdout: stdoutLogs.join('\n'),
      stderr: err.message || 'Execution error',
      executionTimeMs: Date.now() - startTime
    };
  }
}

/**
 * Executes Python code using the local Python interpreter with timeout enforcement.
 */
export async function executePython(code, input = null, timeLimitMs = 3000) {
  const startTime = Date.now();
  try {
    let scriptToRun = code;

    if (input) {
      let parsedInput = null;
      try {
        parsedInput = typeof input === 'string' ? JSON.parse(input) : input;
      } catch {
        parsedInput = input;
      }

      if (parsedInput && Array.isArray(parsedInput.args)) {
        // Look for def function_name(...)
        const funcMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
        if (funcMatch && funcMatch[1]) {
          const funcName = funcMatch[1];
          const serializedArgs = JSON.stringify(parsedInput.args);
          scriptToRun += `\nimport json\nargs = json.loads('''${serializedArgs}''')\nprint(json.dumps(${funcName}(*args)))`;
        }
      }
    }

    const { stdout, stderr } = await execFileAsync('python', ['-c', scriptToRun], {
      timeout: timeLimitMs,
      maxBuffer: 1024 * 1024
    });

    const executionTimeMs = Date.now() - startTime;
    let parsedResult = null;
    try {
      const trimmed = stdout.trim();
      const lastLine = trimmed.split('\n').pop();
      parsedResult = JSON.parse(lastLine);
    } catch {
      parsedResult = stdout.trim();
    }

    return {
      success: true,
      result: parsedResult,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      executionTimeMs
    };
  } catch (err) {
    return {
      success: false,
      result: null,
      stdout: '',
      stderr: err.message || 'Python execution failed',
      executionTimeMs: Date.now() - startTime
    };
  }
}

/**
 * Universal code runner dispatch.
 */
export async function executeCode({ language = 'javascript', code, input = null, timeLimitMs = 3000 }) {
  const normalizedLang = (language || 'javascript').toLowerCase();

  if (normalizedLang === 'javascript' || normalizedLang === 'js') {
    return executeJavaScript(code, input, timeLimitMs);
  } else if (normalizedLang === 'python' || normalizedLang === 'py') {
    return executePython(code, input, timeLimitMs);
  } else {
    // Fallback or unconfigured language
    return {
      success: false,
      result: null,
      stdout: '',
      stderr: `Execution sandbox for language '${language}' is not locally configured.`,
      executionTimeMs: 0
    };
  }
}

/**
 * Executes student SQL query against an ephemeral in-memory SQLite database.
 * Completely isolated from production MySQL database.
 */
export async function executeSQL({ studentSql, schemaSql = '', expectedSql = '' }) {
  let sqliteModule;
  try {
    sqliteModule = await import('node:sqlite');
  } catch (importErr) {
    return {
      success: false,
      error: 'SQLite in-memory sandbox is not supported on this runtime environment.',
      studentRows: [],
      expectedRows: [],
      match: false
    };
  }

  const { DatabaseSync } = sqliteModule;

  try {
    // 1. Run student query on student DB
    const studentDb = new DatabaseSync(':memory:');
    if (schemaSql && schemaSql.trim()) {
      studentDb.exec(schemaSql);
    }

    const trimmedStudentSql = studentSql.trim().replace(/;+$/, '');
    let studentRows = [];
    try {
      studentRows = studentDb.prepare(trimmedStudentSql).all();
    } catch (sqlErr) {
      studentDb.close();
      return {
        success: false,
        error: `SQL Syntax or execution error: ${sqlErr.message}`,
        studentRows: [],
        expectedRows: [],
        match: false
      };
    }
    studentDb.close();

    // 2. If expectedSql provided, run on isolated expected DB and compare
    let expectedRows = [];
    let match = false;

    if (expectedSql && expectedSql.trim()) {
      const expectedDb = new DatabaseSync(':memory:');
      if (schemaSql && schemaSql.trim()) {
        expectedDb.exec(schemaSql);
      }
      const trimmedExpectedSql = expectedSql.trim().replace(/;+$/, '');
      expectedRows = expectedDb.prepare(trimmedExpectedSql).all();
      expectedDb.close();

      // Compare normalized rows
      const sJson = JSON.stringify(studentRows);
      const eJson = JSON.stringify(expectedRows);
      match = sJson === eJson;
    } else {
      match = true;
    }

    return {
      success: true,
      studentRows,
      expectedRows,
      match,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'SQLite execution failed',
      studentRows: [],
      expectedRows: [],
      match: false
    };
  }
}
