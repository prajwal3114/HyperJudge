const { createWorkspace, removeWorkspace } = require('./src/engine/sandbox/sandbox');
const { compile } = require('./src/engine/compiler/compiler');

async function main() {
    let workspace;
    try {
        workspace = await createWorkspace();
        console.log('Workspace created:');
        console.log(workspace);
        console.log(''); // Empty line for readability

        const sourceCode = `#include <iostream>

int main() {
    std::cout << "Hello from HyperJudge!" << std::endl;
    return 0;
}
`;
        
        const result = await compile(sourceCode, workspace);
        console.log('Compilation result:');
        console.log(result);
        console.log('');
        
    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        if (workspace) {
            await removeWorkspace(workspace);
            console.log('Workspace removed.');
        }
    }
}

main();
