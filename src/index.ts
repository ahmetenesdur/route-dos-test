import { Command } from "commander";
import chalk from "chalk";
import endpoints from "../config/endpoints.json";
import limits from "../config/limits.json";
import { BaselineScenario } from "./scenarios/baseline";
import { ParamFuzzScenario } from "./scenarios/param-fuzz";
import { ConcurrencyScenario } from "./scenarios/concurrency";
import { ExploitVerifyScenario } from "./scenarios/exploit-verify";
import { MetricsCollector } from "./analysis/MetricsCollector";
import { SecurityReporter } from "./analysis/SecurityReporter";
import { RequestMetric } from "./core/RequestRunner";

const program = new Command();

program
	.name("route-dos-harness")
	.description("Application-Layer DoS & Amplification Test Harness")
	.version("1.0.0")
	.option(
		"--scenario <type>",
		"Test scenario to run: baseline, fuzz, concurrency, exploit, all",
		"all",
	)
	.option("--target <url>", "Override target URL", endpoints.base);

program.parse();
const options = program.opts();

// Override config if target provided
if (options.target) {
	endpoints.base = options.target;
}

async function main() {
	console.log(chalk.bold("Starting Application-Layer DoS Harness"));
	console.log(`Target: ${chalk.cyan(endpoints.base)}`);
	console.log(
		`Safety Limits: concurrency=${limits.maxConcurrency}, timeout=${limits.globalTimeoutMs}ms\n`,
	);

	const baselineRunner = new BaselineScenario();
	const fuzzer = new ParamFuzzScenario();
	const concurrencyRunner = new ConcurrencyScenario();
	const exploitRunner = new ExploitVerifyScenario();
	const collector = new MetricsCollector();
	const reporter = new SecurityReporter();

	try {
		// 1. Always run Baseline
		const baselineMs = await baselineRunner.run();

		let fuzzResults: RequestMetric[] = [];
		let concurrencyResults: RequestMetric[] = [];

		// 2. Run Fuzzing
		if (options.scenario === "all" || options.scenario === "fuzz") {
			fuzzResults = await fuzzer.run(baselineMs);
		}

		// 3. Run Concurrency
		if (options.scenario === "all" || options.scenario === "concurrency") {
			concurrencyResults = await concurrencyRunner.run(baselineMs);
		}

		// 4. Run Exploit Verification (only when explicitly requested)
		if (options.scenario === "exploit") {
			await exploitRunner.run(baselineMs);
			return; // Exploit scenario has its own reporting
		}

		// 5. Analysis
		const amplifiers = collector.analyzeAmplification(
			fuzzResults,
			baselineMs,
		);
		const concurrencyStats =
			concurrencyResults.length > 0
				? collector.calculateStats(concurrencyResults)
				: null;

		reporter.generateReport(baselineMs, amplifiers, concurrencyStats);

		// 6. Auto-run Exploit if high amplification detected
		if (amplifiers.length > 0 && amplifiers[0].ratio >= 3.0) {
			console.log(
				chalk.yellow(
					"\n  High amplification detected. Running exploit verification...",
				),
			);
			await exploitRunner.run(baselineMs, amplifiers[0].params);
		}
	} catch (err: unknown) {
		const errorMessage =
			err instanceof Error ? err.message : "Unknown error";
		console.error(chalk.red("Fatal Error during execution:"), errorMessage);
		process.exit(1);
	}
}

main();
