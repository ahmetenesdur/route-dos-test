import chalk from "chalk";
import { AmplificationResult } from "./MetricsCollector";
import { StatsResult } from "../types";

export class SecurityReporter {
	generateReport(
		baselineMs: number,
		topAmplifiers: AmplificationResult[],
		concurrencyStats: StatsResult | null,
	) {
		console.log(chalk.bold("\n  Security Assessment Report"));

		console.log(chalk.gray("\n  [ Metrics Overview ]"));
		console.log(
			`  Baseline Latency     : ${chalk.white(baselineMs.toFixed(2) + "ms")}`,
		);

		const worstCase = topAmplifiers[0];
		const maxRatio = worstCase ? worstCase.ratio : 1.0;

		console.log(
			`  Worst-Case Latency   : ${chalk.white((worstCase ? worstCase.duration : 0).toFixed(2) + "ms")}`,
		);
		console.log(
			`  Amplification Ratio  : ${
				maxRatio >= 3
					? chalk.red(maxRatio.toFixed(1) + "x")
					: maxRatio >= 2
						? chalk.yellow(maxRatio.toFixed(1) + "x")
						: chalk.green(maxRatio.toFixed(1) + "x")
			}`,
		);

		if (concurrencyStats) {
			console.log(chalk.gray("\n  [ Concurrency Impact ]"));
			console.log(
				`  Mean Latency         : ${chalk.white(concurrencyStats.mean.toFixed(2) + "ms")}`,
			);
			console.log(
				`  P95 Latency          : ${chalk.white(concurrencyStats.p95.toFixed(2) + "ms")}`,
			);
		}

		console.log(chalk.gray("\n  [ Conclusion ]"));
		if (maxRatio >= 3.0) {
			console.log(
				"  " +
					chalk.red.bold("FAIL") +
					": High Amplification Risk Detected",
			);
			console.log(
				chalk.red(`  • Parameter set causing >3x slowdown found.`),
			);
			if (worstCase) {
				console.log(chalk.gray("\n  Triggering Payload:"));
				console.log(
					chalk.cyan(
						`  ${JSON.stringify(worstCase.params, null, 2).replace(/\n/g, "\n  ")}`,
					),
				);
			}
		} else if (maxRatio >= 2.0) {
			console.log(
				"  " +
					chalk.yellow.bold("WARNING") +
					": Moderate Amplification",
			);
			console.log(
				chalk.yellow(`  • Some parameters cause 2x-3x slowdown.`),
			);
		} else {
			console.log(
				"  " + chalk.green.bold("PASS") + ": System is stable.",
			);
			console.log(
				chalk.green("  No significant amplification detected."),
			);
		}

		if (concurrencyStats && concurrencyStats.mean > baselineMs * 5) {
			console.log(
				"\n  " +
					chalk.red.bold("FAIL") +
					": Severe Concurrency Degradation (>5x baseline)",
			);
		}
		console.log(""); // Final newline
	}
}
