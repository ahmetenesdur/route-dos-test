/**
 * Shared type definitions for the DoS Test Harness.
 * Centralizing types improves maintainability and type safety.
 */

/**
 * Query parameters sent to the target API endpoint.
 */
export interface TestParams {
	amount: string;
	slippage?: number;
	direct: string;
	excludeProtocols: string;
	tokenInAddress?: string;
	tokenOutAddress?: string;
}

/**
 * Statistics calculated from a set of request metrics.
 */
export interface StatsResult {
	mean: number;
	p95: number;
	max: number;
}

/**
 * Configuration for test-params.json
 */
export interface TestParamsConfig {
	amounts: string[];
	slippage?: number[];
	direct: boolean[];
	excludeProtocols: string[];
	tokenPairs: Array<{
		tokenIn: string;
		tokenOut: string;
		name?: string;
	}>;
}

/**
 * Configuration for endpoints.json
 */
export interface EndpointsConfig {
	base: string;
	method: string;
}

/**
 * Configuration for limits.json
 */
export interface LimitsConfig {
	maxConcurrency: number;
	maxRequestsPerSecond: number;
	globalTimeoutMs: number;
	errorThresholdPercent: number;
	maxConsecutiveErrors: number;
}
