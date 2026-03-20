import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		platform: "node",
		format: ["esm", "cjs"],
		dts: true,
		clean: true,
		sourcemap: true,
		publint: {
			enabled: true,
		},
		attw: {
			enabled: true,
		},
	},
	{
		entry: ["src/bin/yarpc-cli.ts"],
		platform: "node",
		format: ["esm"],
		outDir: "dist/bin",
		dts: true,
		clean: false,
		sourcemap: true,
	},
]);
