import axios from "axios";
import pLimit from "p-limit";
import limits from "../../config/limits.json";
import { SafetyGuard } from "./SafetyGuard";
import { TestParams } from "../types";

export interface RequestMetric {
	duration: number; // Wall clock
	status: number;
	data: Record<string, unknown>;
	params: TestParams;
	timestamp: number;
}

export class RequestRunner {
	private limit = pLimit(limits.maxConcurrency);
	private guard = SafetyGuard.getInstance();

	async runBatch(
		url: string,
		method: string,
		paramSets: TestParams[],
		onProgress?: (completed: number, total: number) => void,
	): Promise<RequestMetric[]> {
		let completed = 0;
		const total = paramSets.length;

		const tasks = paramSets.map((params) => {
			return this.limit(async () => {
				if (!this.guard.isActive()) return null;
				const result = await this.executeRequest(url, method, params);
				completed++;
				if (onProgress) onProgress(completed, total);
				return result;
			});
		});

		const results = await Promise.all(tasks);
		return results.filter((r): r is RequestMetric => r !== null);
	}

	private async executeRequest(
		url: string,
		method: string,
		params: TestParams,
	): Promise<RequestMetric> {
		const start = performance.now();
		try {
			const response = await axios({
				url,
				method,
				params,
				timeout: limits.globalTimeoutMs,
				validateStatus: () => true, // Don't throw on error status
			});

			const duration = performance.now() - start;
			const success = response.status < 400;

			this.guard.recordResult(success, response.status);

			return {
				duration,
				status: response.status,
				data: response.data,
				params,
				timestamp: Date.now(),
			};
		} catch (error: unknown) {
			const duration = performance.now() - start;
			this.guard.recordResult(false, 0);

			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";

			return {
				duration,
				status: 0, // Network error
				data: { error: errorMessage },
				params,
				timestamp: Date.now(),
			};
		}
	}
}
