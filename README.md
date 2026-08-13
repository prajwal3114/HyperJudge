# HyperJudge

HyperJudge is a distributed online judge and code execution engine. It provides a scalable, secure backend for compiling and executing untrusted code submissions in an isolated environment.

## 🚀 Architecture

The project is structured with scalability and strict security isolation in mind:

- **`hyperjudgeapi/`**: The core API server and execution engine orchestrator.
  - `src/engine/compiler/`: Securely compiles source code (e.g., leveraging `g++`) without shell injection vulnerabilities.
  - `src/engine/sandbox/`: Manages ephemeral, isolated workspace directories for every single submission to prevent data collision.
  - `src/engine/evaluator/`: Evaluates process output against expected test cases.
- **`hyperjudgeworker/`**: Scalable distributed worker nodes (Architecture planned).

## 🛠️ Security Philosophy

The engine strictly decouples **compilation** from **execution**. By separating these phases, we ensure that the compiler can run normally, while the actual execution of untrusted user binaries will later happen in a heavily restricted Linux sandbox (utilizing tools like NsJail) with strict CPU, memory, and network constraints.

## 💻 Getting Started

To test the current execution engine layers:

1. Navigate to the API directory:
   ```bash
   cd hyperjudgeapi
   ```
2. Run the testing harness:
   ```bash
   node test-engine.js
   ```

## 📜 License

[MIT](LICENSE)
