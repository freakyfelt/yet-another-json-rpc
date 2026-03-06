import js from "@eslint/js";
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettier from "eslint-config-prettier";

export default defineConfig(
	{
		ignores: ["**/dist/**", "**/node_modules/**", "*.js", "*.cjs", "*.mjs"],
	},
	js.configs.recommended,
	tseslint.configs.recommended,
	prettier,
	// Begin project-specific config
	{
		files: ["**/*.ts"],
		rules: {
			"@typescript-eslint/no-floating-promises": "off",
		},
	},
);
