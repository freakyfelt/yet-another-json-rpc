import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts", "src/bin/yarpc-cli.ts"],
	platform: "node",
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	publint: {
		level: "error",
	},
	attw: {
		level: "error",
	},
});
