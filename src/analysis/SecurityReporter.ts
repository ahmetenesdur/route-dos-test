import chalk from "chalk";
import { AmplificationResult } from "./MetricsCollector";
import { StatsResult } from "../types";

export class SecurityReporter {
	generateReport(
		baselineMs: number,
		topAmplifiers: AmplificationResult[],
		concurrencyStats: StatsResult | null,
	) {
		console.log(chalk.bold("\nFINAL SECURITY REPORT"));
		console.log("============================================");

		console.log(`Baseline Latency: ${baselineMs.toFixed(2)}ms`);

		const worstCase = topAmplifiers[0];
		const maxRatio = worstCase ? worstCase.ratio : 1.0;

		console.log(
			`Worst-Case Latency: ${worstCase ? worstCase.duration.toFixed(2) : 0}ms`,
		);
		console.log(`Amplification Ratio: ${maxRatio.toFixed(1)}x`);

		console.log("\nConcurrency Impact:");
		if (concurrencyStats) {
			console.log(
				`  Mean Latency: ${concurrencyStats.mean.toFixed(2)}ms`,
			);
			console.log(`  P95 Latency: ${concurrencyStats.p95.toFixed(2)}ms`);
		}

		console.log("\nSecurity Conclusion:");
		if (maxRatio >= 3.0) {
			console.log(
				chalk.red.bold("FAIL: High Amplification Risk Detected"),
			);
			console.log(
				chalk.red(
					`   - Parameter set causes causing >3x slowdown found.`,
				),
			);
			if (worstCase)
				console.log(
					`   - Trigger: ${JSON.stringify(worstCase.params)}`,
				);
		} else if (maxRatio >= 2.0) {
			console.log(chalk.yellow.bold("WARNING: Moderate Amplification"));
			console.log(
				chalk.yellow(`   - Some parameters cause 2x-3x slowdown.`),
			);
		} else {
			console.log(
				chalk.green.bold(
					"PASS: No significant amplification detected.",
				),
			);
		}

		if (concurrencyStats && concurrencyStats.mean > baselineMs * 5) {
			console.log(
				chalk.red.bold(
					"FAIL: Concurrency causes severe degradation (>5x baseline)",
				),
			);
		}

		console.log("============================================");
	}
}
