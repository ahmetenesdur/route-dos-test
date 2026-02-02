import { RequestRunner } from "../core/RequestRunner";
import endpoints from "../../config/endpoints.json";
import chalk from "chalk";

export class BaselineScenario {
	private runner = new RequestRunner();

	async run(): Promise<number> {
		console.log(chalk.blue("Running Baseline Test..."));

		// Baseline = Minimal params
		const baselineParams = {
			amount: "100",
			direct: "false",
			excludeProtocols: "",
		};

		// Run 5 warm-up requests + 10 measurement requests
		console.log("  - Warming up...");
		await this.runner.runBatch(
			endpoints.base,
			endpoints.method,
			Array(5).fill(baselineParams),
		);

		console.log("  - Measuring...");
		const results = await this.runner.runBatch(
			endpoints.base,
			endpoints.method,
			Array(10).fill(baselineParams),
		);

		const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
		const avgDuration = totalDuration / results.length;

		console.log(
			chalk.green(
				`  [PASS] Baseline Average Duration: ${avgDuration.toFixed(2)}ms`,
			),
		);
		return avgDuration;
	}
}
