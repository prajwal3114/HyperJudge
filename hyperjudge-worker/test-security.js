const { judgeSubmission } = require("./engine");

const tests = [
    {
        name: "Memory Exhaustion (Vector allocation)",
        source: `
        #include <vector>
        int main() {
            std::vector<int> v;
            while(true) v.push_back(1);
            return 0;
        }`,
        expect: "RUNTIME_ERROR", // Should be killed by memory limit
        timeLimit: 2000,
        memoryLimit: 64
    },
    {
        name: "Fork Bomb",
        source: `
        #include <unistd.h>
        int main() {
            while(true) fork();
            return 0;
        }`,
        expect: "TIME_LIMIT_EXCEEDED", // Should be killed by CPU/Time limit or fork fail
        timeLimit: 2000,
        memoryLimit: 128
    },
    {
        name: "Network Access (ping)",
        source: `
        #include <stdlib.h>
        int main() {
            int ret = system("ping -c 1 8.8.8.8");
            return ret == 0 ? 0 : 1;
        }`,
        expect: "RUNTIME_ERROR", // network is isolated
        timeLimit: 2000,
        memoryLimit: 128
    },
    {
        name: "Excessive Output",
        source: `
        #include <iostream>
        int main() {
            while(true) std::cout << "SPAM!" << std::endl;
            return 0;
        }`,
        expect: "TIME_LIMIT_EXCEEDED", // Or RUNTIME_ERROR if stdout pipe breaks. Time limit eventually hits.
        timeLimit: 1000,
        memoryLimit: 128
    },
    {
        name: "Filesystem Traversal (/etc/passwd)",
        source: `
        #include <iostream>
        #include <fstream>
        int main() {
            std::ifstream f("/etc/passwd");
            if (f.good()) return 0; // Success means bad news
            return 1; // Error means it was blocked, but return 1 causes RUNTIME_ERROR
        }`,
        expect: "RUNTIME_ERROR", // Should fail to open or fail to return 0
        timeLimit: 2000,
        memoryLimit: 128
    },
    {
        name: "Create Privileged File (/bin/hacked)",
        source: `
        #include <iostream>
        #include <fstream>
        int main() {
            std::ofstream f("/bin/hacked");
            f << "hacked";
            f.close();
            if (f.good()) return 0;
            return 1;
        }`,
        expect: "RUNTIME_ERROR", // Should fail to write to /bin
        timeLimit: 2000,
        memoryLimit: 128
    },
    {
        name: "Excessive File Creation (in workspace)",
        source: `
        #include <fstream>
        #include <string>
        int main() {
            for(int i=0; i<10000; i++) {
                std::ofstream f(std::to_string(i) + ".txt");
                if (f.fail()) return 1; // Correctly blocked by sandbox
                f << "data";
            }
            return 0;
        }`,
        expect: "RUNTIME_ERROR", // Should be killed by fsize limit or RO mount
        timeLimit: 2000,
        memoryLimit: 128
    },
    {
        name: "Compiler Resource Exhaustion (Huge template)",
        source: `
        template<int N> struct Factorial { enum { value = N * Factorial<N - 1>::value }; };
        template<> struct Factorial<0> { enum { value = 1 }; };
        int main() {
            return Factorial<9999>::value;
        }`,
        expect: "COMPILATION_ERROR", // Should be killed by compiler time/memory limit
        timeLimit: 2000,
        memoryLimit: 256
    }
];

async function runSecurityTests() {
    console.log("HyperJudge Security Adversarial Tests\\n");
    let hasErrors = false;

    for (const test of tests) {
        console.log(`Running: ${test.name}...`);
        const res = await judgeSubmission({
            sourceCode: test.source,
            language: "cpp",
            testCases: [{ id: "test1", input: "", expectedOutput: "0" }],
            timeLimit: test.timeLimit,
            memoryLimit: test.memoryLimit
        });
        
        let actualStatus = res.status;
        
        // Treat TIME_LIMIT_EXCEEDED and RUNTIME_ERROR as both being "sandbox contained it" in some cases.
        // For fork bomb or excessive output, they might hit time limits or SIGKILL.
        if (actualStatus === test.expect || 
            (test.expect === "TIME_LIMIT_EXCEEDED" && actualStatus === "RUNTIME_ERROR") ||
            (test.expect === "RUNTIME_ERROR" && actualStatus === "TIME_LIMIT_EXCEEDED")) {
            console.log(`  [✓] Contained correctly. Status: ${actualStatus}`);
        } else {
            console.log(`  [✗] FAILED or UNEXPECTED. Expected ${test.expect}, got: ${actualStatus}`);
            hasErrors = true;
        }
    }
    
    if (hasErrors) {
        process.exit(1);
    } else {
        console.log("\nAll security tests passed!");
    }
}

runSecurityTests();
