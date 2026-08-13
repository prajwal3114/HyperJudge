const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

async function createWorkspace() {
    const tmpDir = os.tmpdir();
    // Generate a random ID for the workspace
    const randomId = crypto.randomBytes(4).toString('hex').toUpperCase();
    const workspaceName = `hyperjudge-${randomId}`;
    const workspacePath = path.join(tmpDir, workspaceName);

    await fs.mkdir(workspacePath, { recursive: true });
    
    return workspacePath;
}

async function removeWorkspace(workspacePath) {
    try {
        // Recursively remove the workspace directory
        await fs.rm(workspacePath, { recursive: true, force: true });
    } catch (err) {
        // Ignore if directory doesn't exist
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
}

module.exports = {
    createWorkspace,
    removeWorkspace
};
