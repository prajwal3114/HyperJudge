const { createWorkspace, removeWorkspace } = require("./src/engine/sandbox/sandbox");
const { compile } = require("./src/engine/compiler/compiler");
const { evaluate } = require("./src/engine/evaluator/evaluator");
const { runExecutable } = require("./src/engine/runner/runner");

async function judgeSubmission({ sourceCode, language, testCases, timeLimit, memoryLimit }) {
    let workspace = null;

    try {
        // 1. Create unique workspace
        workspace = await createWorkspace();

        // 2. Compile source code ONCE
        const compileResult = await compile(sourceCode, workspace);

        if (!compileResult.success) {
            console.error("COMPILATION_ERROR:", compileResult.error);
            return {
                status: "COMPILATION_ERROR",
                testsPassed: 0,
                testsTotal: testCases.length,
                results: [],
                error: compileResult.error
            };
        }

        const results = [];
        let finalStatus = "ACCEPTED";
        let testsPassed = 0;

        // 3. Execute tests sequentially
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            
            const runResult = await runExecutable(
                compileResult.executablePath,
                testCase.input,
                timeLimit,
                workspace,
                memoryLimit
            );

            let testStatus = runResult.status;

            // If execution succeeded, evaluate actual output against expected output
            if (testStatus === "SUCCESS") {
                const isCorrect = evaluate(runResult.stdout, testCase.expectedOutput);
                if (isCorrect) {
                    testStatus = "ACCEPTED";
                } else {
                    testStatus = "WRONG_ANSWER";
                }
            }

            // Record test case result
            results.push({
                testcaseId: testCase.id || `test-${i + 1}`,
                status: testStatus,
                executionTimeMs: runResult.executionTime,
                stdout: runResult.stdout,
                stderr: runResult.stderr,
                exitCode: runResult.exitCode,
                signal: runResult.signal
            });

            // Stop execution on first failure to save resources
            if (testStatus === "ACCEPTED") {
                testsPassed++;
            } else {
                finalStatus = testStatus;
                break;
            }
        }

        return {
            status: finalStatus,
            testsPassed,
            testsTotal: testCases.length,
            results
        };

    } catch (error) {
        return {
            status: "INTERNAL_ERROR",
            message: error.message
        };
    } finally {
        // Guaranteed cleanup regardless of outcome
        if (workspace) {
            try {
                await removeWorkspace(workspace);
            } catch (err) {
                console.error("Workspace cleanup failed:", err);
            }
        }
    }
}

module.exports = { judgeSubmission };
