# Architecture

```
route-dos-test/
├── config/                 # Configuration
│   ├── endpoints.json      # Target API
│   ├── limits.json         # Safety limits
│   ├── test-params.json    # Fuzzing parameters
│   └── exploit-payload.json # Malicious payload
│
├── src/
│   ├── index.ts            # Entry point
│   │
│   ├── scenarios/          # Test Scenarios
│   │   ├── baseline.ts     # Measures normal response time
│   │   ├── param-fuzz.ts   # Scans parameter combinations
│   │   ├── concurrency.ts  # Parallel load test
│   │   └── exploit-verify.ts # Vulnerability verification
│   │
│   ├── core/               # Infrastructure
│   │   ├── RequestRunner.ts # HTTP requests + concurrency
│   │   └── SafetyGuard.ts   # Emergency stop mechanism
│   │
│   └── analysis/           # Analysis
│       ├── MetricsCollector.ts # Statistics calculation
│       └── SecurityReporter.ts # Result report
```

---

## Data Flow

```
1. Baseline    → Measure normal time (130ms)
       ↓
2. Fuzz        → Test thousands of combinations
       ↓
3. Analyze     → Find slowest combination (10000ms = 77x)
       ↓
4. Report      → PASS / WARNING / FAIL
       ↓
5. Auto-Chain  → If ≥3x amplification, auto-run exploit with discovered payload
       ↓
6. Exploit     → Verify vulnerability in controlled manner
```

---

## Components

### RequestRunner

- Manages all HTTP requests
- Concurrency control via `p-limit`
- Timeout enforcement

### SafetyGuard

- Singleton pattern
- Monitors every request result
- **Emergency Stop:** `process.exit(1)` on 5+ consecutive errors or >20% error rate

### MetricsCollector

- Calculates Amplification Ratio: `worst_case / baseline`
- Statistics: Mean, P95, Max

### SecurityReporter

- Interprets results
- Makes PASS / WARNING / FAIL decision

---

## Exploit Verify Scenario

Tests DoS success while staying under rate limit:

```
Rate Limit: 200 req/min
Safe Rate:  160 req/min (×0.8 margin)
Concurrency: 3 parallel requests

Each request consumes ~10s of server CPU
3 requests × 10s = 30s workload / second
→ Server queue grows continuously
→ Timeout / Crash
```

**Health Check:** Sends lightweight canary request every 5 seconds. If this request slows down or fails → DoS successful.
