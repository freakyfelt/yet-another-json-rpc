import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import pino from "pino";
import YAML from "yaml";
import { DocumentTransformer } from "./transformers";
import { Logger, RPCDocument } from "./types";

const DEFAULT_OUT_PATH = "openapi.json";
const SUPPORTED_FORMATS = ["json", "yaml"] as const;
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

function showHelp() {
	console.log(`
Usage: yarpc-cli [options]

Options:
  -i, --input  [string]     Input RPC file path or "-" for stdin
  -o, --output [string]     Output OpenAPI file path or "-" for stdout (default: openapi.json)
  -f, --format [yaml|json]  Output format (default: json)

  -h, --help     Show help and exit
  -v, --version  Show version number and exit
  -V, --verbose  Show verbose output
`);
}

type EmitOpenAPIParams = {
	input: string;
	output: string;
	format: SupportedFormat;
	logger: Logger;
};

async function emitOpenAPI(params: EmitOpenAPIParams) {
	const { input, output, format, logger } = params;

	const text =
		input === "-"
			? readFileSync(process.stdin.fd, "utf8")
			: readFileSync(input, "utf8");
	const source = YAML.parse(text.toString()) as RPCDocument;

	const transformed = await DocumentTransformer.transform(source, { logger });
	let contents;

	if (format === "yaml") {
		contents =
			YAML.stringify(transformed, { aliasDuplicateObjects: false }) + "\n";
	} else if (format === "json") {
		contents = JSON.stringify(transformed, null, 2) + "\n";
	} else {
		throw new Error(`Unsupported format: ${String(format)}`);
	}

	if (output === "-") {
		process.stdout.write(contents);
	} else {
		await writeFile(output, contents, "utf8");
	}
}

export async function main() {
	const args = parseArgs({
		options: {
			help: { type: "boolean", short: "h" },
			version: { type: "boolean", short: "v" },
			verbose: { type: "boolean", short: "V" },
			input: { type: "string", short: "i" },
			output: { type: "string", short: "o", default: "openapi.json" },
			format: { type: "string", short: "f", default: "json" },
		},
	});

	const logger = pino({
		level: args.values.verbose ? "debug" : "info",
		transport: {
			target: "pino-pretty",
			options: {
				destination: process.stderr.fd,
			},
		},
	});

	if (args.values.help) {
		showHelp();
		return;
	}
	if (args.values.version) {
		console.log(process.env.npm_package_version);
		return;
	}

	const { format = "json", input, output = DEFAULT_OUT_PATH } = args.values;
	if (!input) {
		console.error("Missing required input file path");
		showHelp();
		return;
	}

	if (!SUPPORTED_FORMATS.includes(format as SupportedFormat)) {
		console.error(`Unsupported format: ${String(format)}`);
		showHelp();
		return;
	}

	await emitOpenAPI({
		input,
		output,
		format: format as SupportedFormat,
		logger,
	});
}
