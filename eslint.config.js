import js from "@eslint/js";
import tseslintParser from "@typescript-eslint/parser";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";

export default [
	// Ignores
	{
		ignores: ["**/dist/**", "**/node_modules/**", "*.js", "*.cjs", "*.mjs"],
	},
	// Base configs
	js.configs.recommended,
	// TypeScript ESLint recommended config
	{
		plugins: {
			"@typescript-eslint": tseslintPlugin,
		},
		languageOptions: {
			parser: tseslintParser,
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				sourceType: "module",
				project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
			},
		},
	},
	// TypeScript ESLint recommended rules
	{
		plugins: {
			"@typescript-eslint": tseslintPlugin,
		},
		rules: tseslintPlugin.configs["recommended"].rules,
	},
	// TypeScript ESLint recommended-type-checking rules
	{
		plugins: {
			"@typescript-eslint": tseslintPlugin,
		},
		languageOptions: {
			parser: tseslintParser,
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				sourceType: "module",
				project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
			},
		},
		rules: tseslintPlugin.configs["recommended-requiring-type-checking"].rules,
	},
	// Prettier must be last to override other configs
	prettier,
	// Project-specific config
	{
		files: ["**/*.ts"],
		plugins: {
			"@typescript-eslint": tseslintPlugin,
		},
		rules: {
			"@typescript-eslint/no-floating-promises": "off",
		},
	},
];
