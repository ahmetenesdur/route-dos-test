import { RequestRunner, RequestMetric } from "../core/RequestRunner";
import endpoints from "../../config/endpoints.json";
import params from "../../config/test-params.json";
import chalk from "chalk";
import { TestParams } from "../types";
import cliProgress from "cli-progress";

export class ParamFuzzScenario {
	private runner = new RequestRunner();

	async run(_baselineMs: number): Promise<RequestMetric[]> {
		console.log(
			chalk.blue(
				"\nRunning Parameter Cost Sensitivity Test (Fuzzing)...",
			),
		);

		// Generate Cartesian Product of params
		const paramSets: TestParams[] = [];
		const slippageValues = params.slippage || [0.5]; // Default to 0.5 if not specified

		for (const amount of params.amounts) {
			for (const slippage of slippageValues) {
				for (const direct of params.direct) {
					for (const protocols of params.excludeProtocols) {
						for (const pair of params.tokenPairs) {
							paramSets.push({
								amount,
								slippage,
								direct: String(direct),
								excludeProtocols: protocols,
								tokenInAddress: pair.tokenIn,
								tokenOutAddress: pair.tokenOut,
							});
						}
					}
				}
			}
		}

		console.log(`  - Generated ${paramSets.length} test cases.`);
		console.log("  - executing...");

		const bar = new cliProgress.SingleBar(
			{
				format:
					"Progress |" +
					chalk.cyan("{bar}") +
					"| {percentage}% || {value}/{total} Requests || Duration: {duration_formatted}",
				barCompleteChar: "\u2588",
				barIncompleteChar: "\u2591",
				hideCursor: true,
			},
			cliProgress.Presets.shades_classic,
		);

		bar.start(paramSets.length, 0);

		const results = await this.runner.runBatch(
			endpoints.base,
			endpoints.method,
			paramSets,
			(completed, _total) => {
				bar.update(completed);
			},
		);

		bar.stop();

		return results;
	}
}
