import { RequestRunner, RequestMetric } from "../core/RequestRunner";
import endpoints from "../../config/endpoints.json";
import limits from "../../config/limits.json";
import chalk from "chalk";

export class ConcurrencyScenario {
	private runner = new RequestRunner();

	async run(_baselineMs: number): Promise<RequestMetric[]> {
		console.log(chalk.blue("\nRunning Light Concurrency Test..."));
		console.log(`  - Concurrency Level: ${limits.maxConcurrency}`);

		// Use a slightly heavier payload for concurrency test, but not the worst case
		const payload = {
			amount: "1000",
			direct: "false",
			excludeProtocols: "",
		};

		const requests = Array(limits.maxConcurrency * 2).fill(payload);

		const start = performance.now();
		const results = await this.runner.runBatch(
			endpoints.base,
			endpoints.method,
			requests,
		);
		const totalTime = performance.now() - start;

		const successCount = results.filter(
			(r) => r.status >= 200 && r.status < 300,
		).length;
		console.log(
			`  - Requests: ${requests.length}, Success: ${successCount}`,
		);
		console.log(`  - Total Wall Time: ${totalTime.toFixed(2)}ms`);

		return results;
	}
}
