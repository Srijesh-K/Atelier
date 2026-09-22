import { executeCode, executeSQL } from './sandbox.js';

/**
 * Universal evaluation engine for all 14 question types.
 * Normalizes inputs and outputs into a consistent result contract:
 * {
 *   status: 'correct' | 'partial' | 'incorrect' | 'pending_manual_review' | 'unanswered',
 *   marksAwarded: number,
 *   maxMarks: number,
 *   evaluatorFeedback: string,
 *   testCaseResults?: Array,
 *   metadata?: Object
 * }
 */
export async function evaluateResponse(question, responseData) {
  const maxMarks = Number(question.marks || 1);
  const negativeMarks = Number(question.negative_marks || 0);
  const qType = (question.question_type || '').toLowerCase();

  // If response is null, undefined, or empty string/array
  if (responseData === null || responseData === undefined || responseData === '') {
    return {
      status: 'unanswered',
      marksAwarded: 0,
      maxMarks,
      evaluatorFeedback: 'Question was left unanswered.'
    };
  }

  // Parse config_json if provided as string
  let config = {};
  if (question.config_json) {
    try {
      config = typeof question.config_json === 'string' ? JSON.parse(question.config_json) : question.config_json;
    } catch (e) {
      config = {};
    }
  }

  switch (qType) {
    case 'single_choice': {
      const options = question.options || [];
      const correctOption = options.find(o => Boolean(o.is_correct) || o.is_correct === 1);
      if (!correctOption) {
        return { status: 'unanswered', marksAwarded: 0, maxMarks, evaluatorFeedback: 'No answer key defined.' };
      }

      // Response data can be the option id or option text
      const isMatch = String(responseData) === String(correctOption.id) ||
                      String(responseData).trim().toLowerCase() === String(correctOption.option_text).trim().toLowerCase();

      if (isMatch) {
        return {
          status: 'correct',
          marksAwarded: maxMarks,
          maxMarks,
          evaluatorFeedback: correctOption.explanation || 'Correct answer!'
        };
      } else {
        const penalty = negativeMarks > 0 ? -negativeMarks : 0;
        return {
          status: 'incorrect',
          marksAwarded: penalty,
          maxMarks,
          evaluatorFeedback: 'Incorrect answer.'
        };
      }
    }

    case 'multiple_choice': {
      const options = question.options || [];
      const correctOptionIds = new Set(options.filter(o => Boolean(o.is_correct) || o.is_correct === 1).map(o => String(o.id)));
      const selected = Array.isArray(responseData) ? responseData.map(String) : [String(responseData)];

      if (correctOptionIds.size === 0) {
        return { status: 'unanswered', marksAwarded: 0, maxMarks, evaluatorFeedback: 'No answer key defined.' };
      }

      const correctSelected = selected.filter(id => correctOptionIds.has(id)).length;
      const incorrectSelected = selected.filter(id => !correctOptionIds.has(id)).length;

      const isExactMatch = correctSelected === correctOptionIds.size && incorrectSelected === 0;

      if (isExactMatch) {
        return {
          status: 'correct',
          marksAwarded: maxMarks,
          maxMarks,
          evaluatorFeedback: 'All correct options selected.'
        };
      }

      if (question.partial_credit) {
        // Proportional scoring with penalty for incorrect selections
        const scoreFraction = Math.max(0, (correctSelected - incorrectSelected) / correctOptionIds.size);
        const awarded = Math.round(scoreFraction * maxMarks * 100) / 100;
        return {
          status: awarded > 0 ? 'partial' : 'incorrect',
          marksAwarded: awarded,
          maxMarks,
          evaluatorFeedback: `Partially correct: ${correctSelected} of ${correctOptionIds.size} correct, ${incorrectSelected} incorrect.`
        };
      } else {
        const penalty = negativeMarks > 0 ? -negativeMarks : 0;
        return {
          status: 'incorrect',
          marksAwarded: penalty,
          maxMarks,
          evaluatorFeedback: 'Incorrect selection.'
        };
      }
    }

    case 'true_false': {
      const options = question.options || [];
      const correctOption = options.find(o => Boolean(o.is_correct) || o.is_correct === 1);
      let isMatch = false;

      if (correctOption) {
        isMatch = String(responseData).toLowerCase() === String(correctOption.id).toLowerCase() ||
                  String(responseData).trim().toLowerCase() === String(correctOption.option_text).trim().toLowerCase();
      } else if (config.expectedAnswer !== undefined) {
        isMatch = String(responseData).trim().toLowerCase() === String(config.expectedAnswer).trim().toLowerCase();
      }

      if (isMatch) {
        return {
          status: 'correct',
          marksAwarded: maxMarks,
          maxMarks,
          evaluatorFeedback: 'Correct answer!'
        };
      } else {
        return {
          status: 'incorrect',
          marksAwarded: negativeMarks > 0 ? -negativeMarks : 0,
          maxMarks,
          evaluatorFeedback: 'Incorrect answer.'
        };
      }
    }

    case 'fill_blank': {
      const rawText = String(responseData).trim();
      const acceptedAnswers = config.acceptedAnswers || [];
      const caseSensitive = Boolean(config.caseSensitive);

      // Also extract [[answer]] pattern from question text if configured
      if (acceptedAnswers.length === 0 && question.question_text) {
        const bracketMatches = question.question_text.match(/\[\[(.*?)\]\]/g);
        if (bracketMatches) {
          bracketMatches.forEach(m => acceptedAnswers.push(m.replace(/^\[\[|\]\]$/g, '').trim()));
        }
      }

      const isMatch = acceptedAnswers.some(ans => {
        if (caseSensitive) {
          return rawText === String(ans).trim();
        }
        return rawText.toLowerCase() === String(ans).trim().toLowerCase();
      });

      if (isMatch) {
        return {
          status: 'correct',
          marksAwarded: maxMarks,
          maxMarks,
          evaluatorFeedback: 'Correct answer!'
        };
      } else {
        return {
          status: 'incorrect',
          marksAwarded: 0,
          maxMarks,
          evaluatorFeedback: 'Incorrect value entered.'
        };
      }
    }

    case 'numerical': {
      const numVal = parseFloat(responseData);
      if (isNaN(numVal)) {
        return { status: 'incorrect', marksAwarded: 0, maxMarks, evaluatorFeedback: 'Invalid numerical input.' };
      }

      const target = parseFloat(config.targetValue !== undefined ? config.targetValue : (question.options?.[0]?.option_text || 0));
      const tolerance = parseFloat(config.tolerance || 0);

      const diff = Math.abs(numVal - target);
      if (diff <= tolerance) {
        return {
          status: 'correct',
          marksAwarded: maxMarks,
          maxMarks,
          evaluatorFeedback: `Correct! Value matches target within acceptable tolerance (+/- ${tolerance}).`
        };
      } else {
        return {
          status: 'incorrect',
          marksAwarded: 0,
          maxMarks,
          evaluatorFeedback: `Entered value ${numVal} is outside allowable range.`
        };
      }
    }

    case 'matching': {
      // pairs: [{ left: 'A', right: 'B' }]
      const pairs = config.pairs || [];
      if (!pairs.length) {
        return { status: 'unanswered', marksAwarded: 0, maxMarks, evaluatorFeedback: 'No matching pairs configured.' };
      }

      // responseData: { leftKey: rightValue } or array of { left, right }
      let correctMatches = 0;
      for (const p of pairs) {
        const studentChoice = typeof responseData === 'object' && responseData !== null
          ? (Array.isArray(responseData) ? responseData.find(m => m.left === p.left)?.right : responseData[p.left])
          : null;

        if (studentChoice && String(studentChoice).trim().toLowerCase() === String(p.right).trim().toLowerCase()) {
          correctMatches++;
        }
      }

      const fraction = correctMatches / pairs.length;
      const awarded = Math.round(fraction * maxMarks * 100) / 100;

      return {
        status: fraction === 1 ? 'correct' : (fraction > 0 ? 'partial' : 'incorrect'),
        marksAwarded: awarded,
        maxMarks,
        evaluatorFeedback: `${correctMatches} of ${pairs.length} pairs matched correctly.`
      };
    }

    case 'ordering': {
      // items: ['A', 'B', 'C', ...] in correct order
      const expectedItems = config.items || [];
      const studentItems = Array.isArray(responseData) ? responseData : [];

      if (!expectedItems.length || !studentItems.length) {
        return { status: 'unanswered', marksAwarded: 0, maxMarks, evaluatorFeedback: 'Incomplete sequence.' };
      }

      let correctPositions = 0;
      for (let i = 0; i < expectedItems.length; i++) {
        if (studentItems[i] !== undefined && String(studentItems[i]).trim() === String(expectedItems[i]).trim()) {
          correctPositions++;
        }
      }

      const fraction = correctPositions / expectedItems.length;
      const awarded = Math.round(fraction * maxMarks * 100) / 100;

      return {
        status: fraction === 1 ? 'correct' : (fraction > 0 ? 'partial' : 'incorrect'),
        marksAwarded: awarded,
        maxMarks,
        evaluatorFeedback: `${correctPositions} of ${expectedItems.length} items in correct relative order.`
      };
    }

    case 'code_output': {
      const studentOutput = String(responseData).trim().replace(/\r\n/g, '\n');
      const expectedOutput = String(config.expectedOutput || '').trim().replace(/\r\n/g, '\n');

      const isMatch = studentOutput === expectedOutput;
      return {
        status: isMatch ? 'correct' : 'incorrect',
        marksAwarded: isMatch ? maxMarks : 0,
        maxMarks,
        evaluatorFeedback: isMatch ? 'Output matches expected console output!' : 'Console output did not match expected result.'
      };
    }

    case 'coding':
    case 'debugging': {
      const code = String(responseData).trim();
      const language = config.language || 'javascript';
      const testCases = question.test_cases || [];

      if (!code) {
        return { status: 'unanswered', marksAwarded: 0, maxMarks, evaluatorFeedback: 'No code submitted.' };
      }

      if (!testCases.length) {
        // Fallback: check if basic execution runs without syntax error
        const execRes = await executeCode({ language, code, input: null });
        return {
          status: execRes.success ? 'correct' : 'incorrect',
          marksAwarded: execRes.success ? maxMarks : 0,
          maxMarks,
          evaluatorFeedback: execRes.success ? 'Code executed with zero errors.' : execRes.stderr
        };
      }

      const testCaseResults = [];
      let totalPassed = 0;
      let totalTestCaseMarks = 0;
      let earnedMarks = 0;

      for (const tc of testCases) {
        const tcMarks = Number(tc.marks || (maxMarks / testCases.length));
        totalTestCaseMarks += tcMarks;

        const execRes = await executeCode({
          language,
          code,
          input: tc.input,
          timeLimitMs: config.timeLimitMs || 3000
        });

        let passed = false;
        if (execRes.success) {
          let expectedVal;
          try {
            expectedVal = JSON.parse(tc.expected_output);
          } catch {
            expectedVal = tc.expected_output;
          }

          const actualJson = JSON.stringify(execRes.result);
          const expectedJson = JSON.stringify(expectedVal);

          if (actualJson === expectedJson) {
            passed = true;
          } else if (execRes.stdout && execRes.stdout.trim() === String(tc.expected_output).trim()) {
            passed = true;
          }
        }

        if (passed) {
          totalPassed++;
          earnedMarks += tcMarks;
        }

        testCaseResults.push({
          id: tc.id,
          isHidden: Boolean(tc.is_hidden),
          passed,
          executionTimeMs: execRes.executionTimeMs,
          input: tc.is_hidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.is_hidden ? '[Hidden Test Case]' : tc.expected_output,
          actual: tc.is_hidden ? (passed ? '[Passed]' : '[Failed]') : execRes.result,
          stdout: tc.is_hidden ? '' : execRes.stdout,
          stderr: tc.is_hidden ? (execRes.stderr ? 'Runtime Error' : '') : execRes.stderr
        });
      }

      const finalAwarded = Math.min(maxMarks, Math.round(earnedMarks * 100) / 100);
      const isAllPassed = totalPassed === testCases.length;

      return {
        status: isAllPassed ? 'correct' : (totalPassed > 0 ? 'partial' : 'incorrect'),
        marksAwarded: finalAwarded,
        maxMarks,
        testCaseResults,
        evaluatorFeedback: `${totalPassed} of ${testCases.length} test cases passed.`
      };
    }

    case 'sql': {
      const studentSql = String(responseData).trim();
      const schemaSql = config.schemaSql || '';
      const expectedSql = config.expectedSql || '';

      if (!studentSql) {
        return { status: 'unanswered', marksAwarded: 0, maxMarks, evaluatorFeedback: 'No SQL query provided.' };
      }

      const sqlResult = await executeSQL({ studentSql, schemaSql, expectedSql });

      if (!sqlResult.success) {
        return {
          status: 'incorrect',
          marksAwarded: 0,
          maxMarks,
          evaluatorFeedback: sqlResult.error || 'SQL Query failed execution.'
        };
      }

      if (sqlResult.match) {
        return {
          status: 'correct',
          marksAwarded: maxMarks,
          maxMarks,
          evaluatorFeedback: `Query executed successfully and output matched expected result (${sqlResult.studentRows.length} rows returned).`
        };
      } else {
        return {
          status: 'incorrect',
          marksAwarded: 0,
          maxMarks,
          evaluatorFeedback: `Query executed successfully, but returned results do not match expected criteria.`
        };
      }
    }

    case 'short_answer':
    case 'essay':
    case 'file_upload':
    default: {
      // Manual evaluation required for subjective answers and project file uploads
      return {
        status: 'pending_manual_review',
        marksAwarded: 0,
        maxMarks,
        evaluatorFeedback: 'Submitted successfully. Queued for mentor / instructor manual grading.'
      };
    }
  }
}
