import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

test("maps every Vinylscout CLI command to its public REST route and handles API errors", async () => {
	const server = createServer((request, response) => {
		response.setHeader("Content-Type", "application/json");
		const url = new URL(request.url, "http://localhost");
		if (url.pathname.endsWith("/missing")) {
			response
				.writeHead(404)
				.end(JSON.stringify({ code: "not_found", error: "No result" }));
		} else if (url.searchParams.get("q") === "throttled") {
			response
				.writeHead(429, { "Retry-After": "8" })
				.end(JSON.stringify({ code: "rate_limited", error: "Slow down" }));
		} else {
			response.end(
				JSON.stringify({
					path: url.pathname,
					query: Object.fromEntries(url.searchParams),
				}),
			);
		}
	}).listen(0, "127.0.0.1");
	await once(server, "listening");

	const bin = fileURLToPath(new URL("../bin/vinylscout.mjs", import.meta.url));
	const run = (...args) =>
		promisify(execFile)(process.execPath, [bin, ...args], {
			env: {
				...process.env,
				VINYLSCOUT_BASE_URL: `http://127.0.0.1:${server.address().port}`,
			},
		});

	try {
		for (const [args, path, query] of [
			[
				["search", "Simon & Garfunkel", "--limit", "2"],
				"/api/v1/search",
				{ limit: "2", q: "Simon & Garfunkel" },
			],
			[
				["album", "fleetwood-mac-rumours"],
				"/api/v1/albums/fleetwood-mac-rumours",
				{},
			],
			[
				["deals", "--sort=saved", "--max-price=25"],
				"/api/v1/deals",
				{ max_price: "25", sort: "saved" },
			],
			[["shops"], "/api/v1/shops", {}],
			[["price-index", "--months=3"], "/api/v1/price-index", { months: "3" }],
			[
				["record-players", "--bluetooth=false"],
				"/api/v1/record-players",
				{ bluetooth: "false" },
			],
			[
				["record-player", "sony-ps-lx310bt"],
				"/api/v1/record-players/sony-ps-lx310bt",
				{},
			],
			[
				["search", "studio", "--sandbox"],
				"/api/sandbox/v1/search",
				{ q: "studio" },
			],
			[
				["album", "studio-noord-voorbeeldplaat", "--sandbox"],
				"/api/sandbox/v1/albums/studio-noord-voorbeeldplaat",
				{},
			],
		]) {
			const output = await run(...args);
			assert.equal(output.stderr, "");
			assert.deepEqual(JSON.parse(output.stdout), { path, query });
		}
		assert.match((await run("--help")).stdout, /Usage: vinylscout/);
		await assert.rejects(run("shops", "--sandbox"), {
			code: 1,
			stderr: /sandbox supports search and album/,
			stdout: "",
		});
		await assert.rejects(run("album", "../shops"), {
			code: 1,
			stderr: /slug can contain only/,
			stdout: "",
		});
		await assert.rejects(run("album", "missing"), {
			code: 1,
			stderr: /HTTP 404 not_found/,
			stdout: "",
		});
		await assert.rejects(run("search", "throttled"), {
			code: 1,
			stderr: /HTTP 429 rate_limited.*Retry-After: 8/,
			stdout: "",
		});
	} finally {
		server.close();
	}
});
