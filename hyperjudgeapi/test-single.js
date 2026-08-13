const fs = require('fs');
const { judgeSubmission } = require('./engine');

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: node test-single.js <path-to-cpp-file>");
        process.exit(1);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const sourceCode = fs.readFileSync(filePath, 'utf8');

    console.log(`Testing file: ${filePath}`);
    
    const res = await judgeSubmission({
        sourceCode: sourceCode,
        language: "cpp",
        testCases: [{ id: "test1", input: "5\n", expectedOutput: "25" }], // Dummy test case
        timeLimit: 2000,
        memoryLimit: 256
    });

    console.log("\nVerdict:", res.status);
    console.log("Details:");
    if (res.results && res.results.length > 0) {
        console.log("Stdout:", res.results[0].stdout);
        console.log("Stderr:", res.results[0].stderr);
        console.log("Execution Time:", res.results[0].executionTimeMs, "ms");
    } else if (res.error) {
        console.log("Compiler Error:", res.error);
    }
}

main();
