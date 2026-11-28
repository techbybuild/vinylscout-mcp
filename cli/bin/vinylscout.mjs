#!/usr/bin/env node
import { parseArgs } from "node:util";

const HELP = `Usage: vinylscout <command> [argument] [options]

  search <query> [--limit N]
  album <slug>
  deals [--min-price EUR] [--max-price EUR] [--sort discount|price|saved] [--limit N]
  shops
  price-index [--months N]
  record-players [--q QUERY] [--max-price EUR] [--limit N]
                 [--bluetooth true|false] [--preamp true|false] [--automatic true|false]
                 [--speakers true|false] [--usb true|false]
  record-player <slug>

Use --sandbox with search or album to fetch fixed test data. Successful commands
write JSON to stdout. Errors go to stderr and exit with a nonzero status.
Documentation: https://vinylscout.nl/cli`;

const COMMANDS = {
	album: { argument: "slug", path: "albums" },
	deals: {
		options: ["min-price", "max-price", "sort", "limit"],
		path: "deals",
	},
	"price-index": { options: ["months"], path: "price-index" },
	"record-player": { argument: "slug", path: "record-players" },
	"record-players": {
		options: [
			"q",
			"max-price",
			"limit",
			"bluetooth",
			"preamp",
			"automatic",
			"speakers",
			"usb",
		],
		path: "record-players",
	},
	search: { argument: "query", options: ["limit"], path: "search" },
	shops: { path: "shops" },
};

async function run([command, ...args]) {
	if (!command || command === "--help" || command === "help") {
		console.log(HELP);
		return;
	}
	if (args.includes("--help")) {
		console.log(HELP);
		return;
	}
	if (!Object.hasOwn(COMMANDS, command))
		throw new Error(`Unknown command "${command}". Run vinylscout --help.`);
	const { argument, options = [], path } = COMMANDS[command];
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		args,
		options: {
			...Object.fromEntries(options.map((name) => [name, { type: "string" }])),
			sandbox: { type: "boolean" },
		},
	});
	const { sandbox, ...queryOptions } = values;
	if (
		positionals.length !== (argument ? 1 : 0) ||
		(argument && !positionals[0]?.trim())
	) {
		throw new Error(
			`Usage: vinylscout ${command}${argument ? ` <${argument}>` : ""}`,
		);
	}
	if (sandbox && command !== "search" && command !== "album") {
		throw new Error("The sandbox supports search and album.");
	}

	const suffix =
		argument === "slug" ? `/${encodeURIComponent(positionals[0])}` : "";
	if (argument === "slug" && !/^[a-z0-9-]+$/i.test(positionals[0])) {
		throw new Error("A slug can contain only letters, numbers and hyphens.");
	}
	const url = new URL(
		`/api/${sandbox ? "sandbox/" : ""}v1/${path}${suffix}`,
		process.env.VINYLSCOUT_BASE_URL || "https://vinylscout.nl",
	);
	if (argument === "query") url.searchParams.set("q", positionals[0]);
	for (const [name, value] of Object.entries(queryOptions)) {
		url.searchParams.set(name.replaceAll("-", "_"), value);
	}

	const response = await fetch(url, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(15_000),
	});
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		const code = data?.code ? ` ${data.code}` : "";
		const reason = typeof data?.error === "string" ? `: ${data.error}` : "";
		const retry = response.headers.get("Retry-After");
		throw new Error(
			`HTTP ${response.status}${code}${reason}${retry ? ` Retry-After: ${retry}` : ""}`,
		);
	}
	if (data === null)
		throw new Error("The API returned an invalid JSON response.");
	console.log(JSON.stringify(data, null, 2));
}

try {
	await run(process.argv.slice(2));
} catch (error) {
	console.error(`vinylscout: ${error.message}`);
	process.exitCode = 1;
}
