import http from "http";

const PORT = 3000;

class MockServer {
	start() {
		const server = http.createServer(async (req, res) => {
			const url = new URL(req.url || "", `http://localhost:${PORT}`);

			if (url.pathname === "/base/route") {
				await this.handleRoute(url, res);
			} else {
				res.writeHead(404);
				res.end("Not Found");
			}
		});

		server.listen(PORT, () => {
			console.log(`Mock Server running on port ${PORT}`);
			console.log(`- Endpoint: http://localhost:${PORT}/base/route`);
		});
	}

	private async handleRoute(url: URL, res: http.ServerResponse) {
		const params = url.searchParams;
		const amount = parseInt(params.get("amount") || "0");

		// Simulate "Computation"
		let delay = 50; // Baseline 50ms

		// SIMULATED VULNERABILITY:
		// If amount is high, delay increases disproportionately (Amplification)
		if (amount > 1000) {
			delay = 200; // 4x amplification
		}
		if (amount > 100000) {
			delay = 500; // 10x amplification
		}

		// Simulate Concurrency Issues (simple random failure if hitting it hard)
		// Note: Simple Node http server is single threaded so it naturally queues,
		// but we can simulate "overload" by random 503s if needed.
		// tailored for test verification:
		if (Math.random() < 0.01) {
			// 1% random failure
			res.writeHead(503);
			res.end("Service Unavailable");
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, delay));

		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(
			JSON.stringify({
				route: "mock-route-data",
				time: delay + "ms",
			}),
		);
	}
}

new MockServer().start();
