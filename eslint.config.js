import js from "@eslint/js";
import tseslintParser from "@typescript-eslint/parser";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";

export default [
	{
		ignores: ["**/dist/**", "**/node_modules/**", "*.js", "*.cjs", "*.mjs"],
	},
	js.configs.recommended,
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
	{
		plugins: {
			"@typescript-eslint": tseslintPlugin,
		},
		rules: tseslintPlugin.configs["recommended"].rules,
	},
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
	prettier,
	// Begin project-specific config
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
