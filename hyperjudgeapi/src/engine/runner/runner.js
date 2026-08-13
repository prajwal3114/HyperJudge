const { spawn } = require('child_process');
const { performance } = require('perf_hooks');
const path = require('path');

const NSJAIL_PATH = '/home/prajwal311/hyperjudge-deps/nsjail/nsjail';

/**
 * Executes a compiled executable safely with a time limit.
 *
 * @param {string} executablePath - Absolute path to the executable file.
 * @param {string} input - Input string to pass to the process's stdin.
 * @param {number} timeLimit - Time limit in milliseconds.
 * @param {string} workspace - Absolute path to the dynamically created workspace.
 * @returns {Promise<Object>} The structured result of the execution.
 */
function runExecutable(executablePath, input, timeLimit, workspace, memoryLimit = 256) {
    return new Promise((resolve, reject) => {
        const start = performance.now();
        
        let child;
        try {
            const configPath = path.resolve(__dirname, '../../../sandbox/nsjail/configs/execute.conf');
            
            const nsjailArgs = [
                '--config', configPath,
                '--user', '99999',
                '--group', '99999',
                '--time_limit', (timeLimit / 1000).toString(),
                '--rlimit_cpu', Math.ceil(timeLimit / 1000 + 1).toString(), // CPU limit slightly higher than wall-clock
                '--rlimit_as', memoryLimit.toString(),
                '-R', workspace, // Bind mount workspace Read-Only
                '--',
                executablePath
            ];

            // We use spawn without a shell for security and control
            child = spawn(NSJAIL_PATH, nsjailArgs, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
        } catch (error) {
            // Catch immediate synchronous spawning errors
            return resolve({
                status: 'RUNTIME_ERROR',
                stdout: '',
                stderr: error.message,
                exitCode: null,
                signal: null,
                executionTime: Math.round(performance.now() - start)
            });
        }

        let stdout = '';
        let stderr = '';
        let isTimedOut = false;

        // Setup output streams
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        let timeoutId;

        // Handle process-level asynchronous errors (e.g., ENOENT after spawn)
        child.on('error', (err) => {
            if (timeoutId) clearTimeout(timeoutId);
            resolve({
                status: 'RUNTIME_ERROR',
                stdout,
                stderr: stderr || err.message,
                exitCode: null,
                signal: null,
                executionTime: Math.round(performance.now() - start)
            });
        });

        // Handle stream errors for stdin (e.g. process exits before stdin is fully written, causing EPIPE)
        child.stdin.on('error', (err) => {
            // Ignore broken pipe errors; the 'close' event will handle the actual exit logic
        });
        
        // Write input to stdin
        if (input) {
            child.stdin.write(input);
        }
        child.stdin.end();

        // Setup the TLE timer
        timeoutId = setTimeout(() => {
            isTimedOut = true;
            // Send SIGKILL to forcefully terminate the process
            child.kill('SIGKILL');
        }, timeLimit);

        // Handle process completion
        child.on('close', (code, signal) => {
            // Clear the timer immediately to avoid race conditions
            clearTimeout(timeoutId);
            const executionTime = Math.round(performance.now() - start);

            // 1. Check for TLE
            if (isTimedOut) {
                return resolve({
                    status: 'TIME_LIMIT_EXCEEDED',
                    stdout,
                    stderr,
                    exitCode: code,
                    signal: signal || 'SIGKILL',
                    executionTime
                });
            }

            // 2. Check for Runtime Error caused by termination signals (e.g., SIGSEGV, SIGABRT)
            if (signal) {
                return resolve({
                    status: 'RUNTIME_ERROR',
                    stdout,
                    stderr,
                    exitCode: code,
                    signal,
                    executionTime
                });
            }

            // 3. Check for Runtime Error caused by non-zero exit code
            if (code !== 0) {
                return resolve({
                    status: 'RUNTIME_ERROR',
                    stdout,
                    stderr,
                    exitCode: code,
                    signal: null,
                    executionTime
                });
            }

            // 4. Success
            return resolve({
                status: 'SUCCESS',
                stdout,
                stderr,
                exitCode: code,
                signal: null,
                executionTime
            });
        });
    });
}

module.exports = {
    runExecutable
};