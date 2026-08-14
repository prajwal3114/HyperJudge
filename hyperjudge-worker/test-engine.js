const { judgeSubmission } = require("./engine");

const validCppSource = `
#include <iostream>
using namespace std;
int main() {
    int x;
    if (cin >> x) {
        cout << x * x;
    }
    return 0;
}
`;

const wrongCppSource = `
#include <iostream>
using namespace std;
int main() {
    int x;
    if (cin >> x) {
        cout << x + x; // Intentionally wrong logic
    }
    return 0;
}
`;

const compileErrorSource = `
#include <iostream>
int main() {
    this is not valid c++;
    return 0;
}
`;

const runtimeErrorSource = `
int main() {
    int *p = nullptr;
    *p = 42;
    return 0;
}
`;

const tleSource = `
int main() {
    while(true) {}
    return 0;
}
`;

const stderrSuccessSource = `
#include <iostream>
using namespace std;
int main() {
    int x;
    if (cin >> x) {
        cerr << "debug info";
        cout << x * x;
    }
    return 0;
}
`;

const validTestCases = [];
for (let i = 1; i <= 10; i++) {
    validTestCases.push({
        id: `Test ${i}`,
        input: `${i}`,
        expectedOutput: `${i * i}`
    });
}

async function runTests() {
    console.log("HyperJudge Engine Integration Test\n");

    let hasErrors = false;

    console.log("Submission");
    console.log("-----------");
    console.log("Language: C++17");
    console.log("Test Cases: 10");
    console.log("Time Limit: 2000 ms\n");
    console.log("Results");
    console.log("-------");

    const res1 = await judgeSubmission({
        sourceCode: validCppSource,
        language: "cpp",
        testCases: validTestCases,
        timeLimit: 2000,
        memoryLimit: 256
    });

    for (const res of res1.results) {
        const mark = res.status === "ACCEPTED" ? "✓" : "✗";
        console.log(`${mark} ${res.testcaseId.padEnd(8)} ${res.status}`);
    }

    console.log(`\n--------------------------------`);
    console.log(`Final Verdict: ${res1.status}`);
    console.log(`Passed: ${res1.testsPassed}/${res1.testsTotal}`);
    console.log(`--------------------------------\n`);

    if (res1.status !== "ACCEPTED") hasErrors = true;

    console.log("Running Negative Tests...\n");

    const negCases = [
        { name: "Test A - Wrong Answer", source: wrongCppSource, expect: "WRONG_ANSWER" },
        { name: "Test B - Compilation Error", source: compileErrorSource, expect: "COMPILATION_ERROR" },
        { name: "Test C - Runtime Error", source: runtimeErrorSource, expect: "RUNTIME_ERROR" },
        { name: "Test D - Time Limit Exceeded", source: tleSource, expect: "TIME_LIMIT_EXCEEDED", timeLimit: 500 },
        { name: "Test E - Stderr but successful", source: stderrSuccessSource, expect: "ACCEPTED" }
    ];

    for (const nc of negCases) {
        const res = await judgeSubmission({
            sourceCode: nc.source,
            language: "cpp",
            testCases: [validTestCases[0]],
            timeLimit: nc.timeLimit || 2000,
            memoryLimit: 256
        });

        if (res.status === nc.expect) {
            console.log(`✓ ${nc.name} -> Got expected: ${res.status}`);
        } else {
            console.log(`✗ ${nc.name} -> Expected ${nc.expect}, got: ${res.status}`);
            hasErrors = true;
        }
    }

    console.log("\nWorkspace cleaned successfully.");
    if (hasErrors) {
        process.exit(1);
    }
}
// test has been done throiught the ns jail 

runTests();
