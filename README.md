# Application-Layer DoS & Amplification Test Harness

> **A safe, autonomous, and role-based testing tool designed to detect App-Layer DoS and Payload Amplification vulnerabilities.**

This project is a specialized test harness built to evaluate API endpoints for **resource exhaustion risks**. It measures how the server responds to complex parameter combinations and detects if small input changes cause disproportionate (amplified) computational cost.

---

## Key Features

- **Safety First:** Built-in **SafetyGuard** monitors error rates real-time. Automatically aborts testing if the target service becomes unstable (successive 5xx/429 errors).
- **Role-Based Architecture:** Logic is split into distinct agent roles (Architect, Engineer, Analyst) for separation of concerns.
- **Amplification Detection:** Automatically calculates the "Amplification Ratio" to identify inputs that are computationally expensive.
- **Concurrency Control:** strict `p-limit` implementation ensures we test _concurrency_ without _flooding_.
- **Automated Reporting:** Generates clear Pass/Warning/Fail reports based on predefined security criteria.

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd route-dos-test

# Install dependencies
pnpm install
```

---

## Configuration

The project uses a config-driven approach. You don't need to change code to test different endpoints.

### 1. Define Target (`config/endpoints.json`)

```json
{
	"base": "https://api.fibrous.finance/base/route",
	"method": "GET"
}
```

### 2. Set Safety Limits (`config/limits.json`)

Critical for responsible testing.

```json
{
	"maxConcurrency": 10, // Max parallel requests
	"globalTimeoutMs": 10000, // Socket timeout
	"errorThresholdPercent": 20 // Abort if >20% requests fail
}
```

### 3. Fuzzing Parameters (`config/test-params.json`)

Define the inputs to permute. The harness creates a Cartesian product of these lists to find the "worst-case" combination.

```json
{
	"amounts": ["100", "1000", "10000", "1000000"],
	"direct": [true, false],
	"excludeProtocols": ["", "3", "57", "3,57,13,53"],
	"tokenPairs": [
		{
			"tokenIn": "0x0000000000000000000000000000000000000000",
			"tokenOut": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
		}
	]
}
```

---

## Usage

### Run All Tests

```bash
pnpm start
```

### Run Specific Scenarios

You can run individual test phases:

```bash
# 1. Baseline: Establish normal latency
pnpm start -- --scenario baseline

# 2. Fuzzing: Search for amplification (Expensive inputs)
pnpm start -- --scenario fuzz

# 3. Concurrency: Test stability under load
pnpm start -- --scenario concurrency
```

### Verification (Mock Server)

To see the tool in action without hitting a real API, start the included Mock Server:

```bash
# Terminal 1: Start Mock Server
pnpm run serve:mock

# Terminal 2: Run Harness against Mock
pnpm start -- --target http://localhost:3000/base/route
```

---

## Interpreting Results

The final report provides a clear security conclusion:

```text
FINAL SECURITY REPORT
============================================
Baseline Latency: 53.15ms
Worst-Case Latency: 504.56ms
Amplification Ratio: 9.5x  <-- KEY METRIC
```

| Metric                  | Description                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Amplification Ratio** | `Worst Case Time` / `Baseline Time`. Shows how much slower the server gets with complex inputs. |
| **< 2x**                | **PASS:** System scales well.                                                                   |
| **2x - 3x**             | **WARNING:** Some inputs cause noticeable load.                                                 |
| **> 3x**                | **FAIL:** Vulnerable to DoS via amplification.                                                  |

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a deep dive into the internal design and Agent Roles.

---

## Safety & Ethics

This tool is designed for **defensive security testing**.

1.  **Do not** use against production systems without explicit permission.
2.  **Do not** increase `maxConcurrency` to flood levels.
3.  The `SafetyGuard` is enabled by default to prevent accidental denial of service.

---

_Built with TypeScript, Axios._
