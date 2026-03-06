import js from "@eslint/js";
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettier from "eslint-config-prettier";

export default defineConfig(
	{
		ignores: ["**/dist/**", "**/node_modules/**", "*.js"],
	},
	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	prettier,
	// Begin project-specific config
	{
		files: ["**/*.ts"],
		rules: {
			"@typescript-eslint/no-floating-promises": "off",
		},
	},
);
