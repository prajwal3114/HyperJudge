const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');

async function compile(sourceCode, workDir) {
    const sourceFile = path.join(workDir, 'main.cpp');
    const executableFile = path.join(workDir, 'main');

    try {
        // Write the C++ source code to main.cpp
        await fs.writeFile(sourceFile, sourceCode);

        return new Promise((resolve) => {
            // Use spawn to execute the compiler safely, avoiding shell injection
            const compiler = spawn('g++', [
                '-std=c++17',
                '-O2',
                sourceFile,
                '-o',
                executableFile
            ]);

            let stderrData = '';

            compiler.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            compiler.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        executablePath: executableFile
                    });
                } else {
                    resolve({
                        success: false,
                        error: stderrData.trim()
                    });
                }
            });

            compiler.on('error', (err) => {
                resolve({
                    success: false,
                    error: `Process error: ${err.message}`
                });
            });
        });
    } catch (err) {
        return {
            success: false,
            error: `Failed to setup workspace: ${err.message}`
        };
    }
}

module.exports = { compile };
