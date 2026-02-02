import limits from "../../config/limits.json";
import chalk from "chalk";

export class SafetyGuard {
	private static instance: SafetyGuard;
	private consecutiveErrors = 0;
	private totalErrors = 0;
	private totalRequests = 0;
	private active = true;

	private constructor() {}

	public static getInstance(): SafetyGuard {
		if (!SafetyGuard.instance) {
			SafetyGuard.instance = new SafetyGuard();
		}
		return SafetyGuard.instance;
	}

	public recordResult(success: boolean, statusCode?: number) {
		if (!this.active) return;

		this.totalRequests++;

		if (!success) {
			this.totalErrors++;
			this.consecutiveErrors++;

			const isCriticalError =
				statusCode && (statusCode >= 500 || statusCode === 429);

			if (isCriticalError) {
				this.checkThresholds();
			}
		} else {
			this.consecutiveErrors = 0;
		}
	}

	private checkThresholds() {
		if (this.consecutiveErrors >= limits.maxConsecutiveErrors) {
			this.triggerEmergencyStop(
				`Too many consecutive errors (${this.consecutiveErrors})`,
			);
		}

		const errorRate = (this.totalErrors / this.totalRequests) * 100;
		if (
			this.totalRequests > 10 &&
			errorRate > limits.errorThresholdPercent
		) {
			this.triggerEmergencyStop(
				`Error rate too high (${errorRate.toFixed(1)}%)`,
			);
		}
	}

	private triggerEmergencyStop(reason: string) {
		this.active = false;
		console.error(chalk.red.bold(`\nEMERGENCY STOP TRIGGERED: ${reason}`));
		console.error(
			chalk.red("Aborting all pending requests and exiting..."),
		);
		process.exit(1);
	}

	public isActive(): boolean {
		return this.active;
	}
}
