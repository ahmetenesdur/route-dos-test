# Architecture & Agent Roles

This project follows a **Role-Based Agent Model** to simulate a complete QA/Security team workflow. Instead of a monolithic script, the codebase is organized into modules that mimic human roles.

## Roles & Responsibilities

### 1. Role: Test Architect

- **Responsibility:** Defines _what_ to test and _how_ to measure success.
- **Code Location:** `config/`
    - `endpoints.json`: Target definition.
    - `test-params.json`: The "Test Matrix".
    - `limits.json`: Acceptance criteria and safety boundaries.

### 2. Role: Load & Param Engineer

- **Responsibility:** Executes the requests safely and efficiently.
- **Code Location:** `src/core/` and `src/scenarios/`
    - **Engineer (Execution):** `RequestRunner.ts` handles the actual HTTP calls, concurrency management (`p-limit`), and timeout enforcement.
    - **Safety Officer:** `SafetyGuard.ts` sits alongside the engineer, monitoring every result. If errors spike, it pulls the emergency brake (Process Exit).

### 3. Role: Metrics & Analysis Agent

- **Responsibility:** Makes sense of the raw data.
- **Code Location:** `src/analysis/MetricsCollector.ts`
    - Collects raw timing data.
    - Calculates statistical significance (Mean, P95).
    - **Crucial Task:** Computes the "Amplification Ratio" by comparing `Fuzz` results against `Baseline`.

### 4. Role: Security Reviewer

- **Responsibility:** Delivers the final verdict.
- **Code Location:** `src/analysis/SecurityReporter.ts`
    - Reads the metrics from the Analyst.
    - Applies business attributes (PASS/FAIL thresholds).
    - Generates the human-readable report.

---

## Data Flow

1.  **Initialization:** `src/index.ts` loads config (Architect).
2.  **Baseline:** `BaselineScenario` establishes ground truth (Engineer).
3.  **Fuzzing:** `ParamFuzzScenario` generates permutations (Engineer) and feeds data to Analyst.
4.  **Analysis:** `MetricsCollector` finds the outliers (Analyst).
5.  **Reporting:** `SecurityReporter` prints the final assessment (Reviewer).

## The "SafetyGuard" Mechanism

The `SafetyGuard` is a singleton observer pattern.

1.  Every request executed by `RequestRunner` reports its status (Success/Fail/Timeout) to `SafetyGuard`.
2.  `SafetyGuard` maintains a moving window of error rates.
3.  **Trigger Condition:** If `Consecutive Errors > 5` OR `Error Rate > 20%`, it trips.
4.  **Action:** `process.exit(1)` immediately stops all pending promises, effectively cutting traffic to the target.

This ensures that even if you configure a heavy test, the harness self-terminates if the target starts dying.
