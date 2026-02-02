import { RequestMetric } from "../core/RequestRunner";
import * as math from "mathjs";
import { TestParams, StatsResult } from "../types";

export interface AmplificationResult {
	params: TestParams;
	ratio: number;
	duration: number;
	baseline: number;
}

export class MetricsCollector {
	analyzeAmplification(
		results: RequestMetric[],
		baselineMs: number,
	): AmplificationResult[] {
		return results
			.map((r) => ({
				params: r.params,
				duration: r.duration,
				baseline: baselineMs,
				ratio: r.duration / Math.max(baselineMs, 1),
			}))
			.sort((a, b) => b.ratio - a.ratio);
	}

	calculateStats(results: RequestMetric[]): StatsResult {
		const durations = results.map((r) => r.duration);
		if (durations.length === 0) return { mean: 0, p95: 0, max: 0 };

		return {
			mean: math.mean(durations),
			p95: math.quantileSeq(durations, 0.95),
			max: math.max(durations),
		};
	}
}
