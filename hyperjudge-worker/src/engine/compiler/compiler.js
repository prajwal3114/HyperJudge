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
            const NSJAIL_PATH = '/home/prajwal311/hyperjudge-deps/nsjail/nsjail';
            const configPath = path.resolve(__dirname, '../../../sandbox/nsjail/configs/compile.conf');
            
            const nsjailArgs = [
                '--config', configPath,
                '--user', '99999',
                '--group', '99999',
                '-B', workDir, // Mount workspace read-write so compiler can output main
                '--',
                '/usr/bin/g++',
                '-std=c++17',
                '-O2',
                sourceFile,
                '-o',
                executableFile
            ];

            // Use spawn to execute the compiler safely via NSJail
            const compiler = spawn(NSJAIL_PATH, nsjailArgs);

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
