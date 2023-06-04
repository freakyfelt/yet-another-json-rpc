export * from "./oas.js";
export * from "./operations.js";
export * from "./service.js";

export type Logger = {
	debug: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
};
