# Route DoS Test Harness

A security testing tool to detect **Application-Layer DoS** and **Payload Amplification** vulnerabilities in API endpoints.

---

## What is this?

Some API requests can exhaust server resources **disproportionately** based on parameter combinations. This tool:

- Finds which parameter combinations slow down the server
- Calculates "Amplification Ratio" (e.g., 77x = 77 times slower than normal)
- Verifies discovered vulnerabilities with controlled exploit testing

---

## Installation

```bash
git clone <repo-url>
cd route-dos-test
pnpm install
```

---

## Usage

### Run All Tests

```bash
pnpm test:all
```

### Run Specific Test

```bash
pnpm test:baseline      # Measure normal response time
pnpm test:fuzz          # Scan parameter combinations
pnpm test:concurrency   # Concurrent load test
pnpm test:exploit       # Verify discovered vulnerability
```

---

## Test Scenarios

| Scenario        | Purpose                                   | Output                    |
| --------------- | ----------------------------------------- | ------------------------- |
| **Baseline**    | Measures normal response time             | `Baseline: 130ms`         |
| **Fuzz**        | Tests thousands of parameter combinations | Finds slowest combination |
| **Concurrency** | Parallel load testing                     | P95 latency               |
| **Exploit**     | Tests vulnerability under rate limit      | DoS achieved?             |

> **Auto-Exploit:** When running `test:all`, if amplification ≥3x is detected, exploit test runs automatically with the discovered payload.

---

## Example Output

```
Security Assessment Report

[ Metrics Overview ]
Baseline Latency     : 130.50ms
Worst-Case Latency   : 10032.49ms
Amplification Ratio  : 76.9x

[ Conclusion ]
FAIL: High Amplification Risk Detected
• Parameter set causing >3x slowdown found.
```

**Result Interpretation:**

| Amplification | Status                             |
| ------------- | ---------------------------------- |
| < 2x          | ✅ PASS - System is stable         |
| 2x - 3x       | ⚠️ WARNING - Needs attention       |
| > 3x          | ❌ FAIL - DoS vulnerability exists |

---

## Configuration

All settings in `config/` directory:

| File                   | Contents                            |
| ---------------------- | ----------------------------------- |
| `endpoints.json`       | Target API URL                      |
| `limits.json`          | Concurrency, timeout, safety limits |
| `test-params.json`     | Parameter matrix for fuzzing        |
| `exploit-payload.json` | Verified malicious payload          |

---

## Safety

This tool is for **defensive security testing** only.

- ⚠️ Only use on systems you have permission to test
- SafetyGuard: Auto-stops if target becomes unstable
- Rate limit compliant exploit testing

---

## Architecture

For technical details see: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
