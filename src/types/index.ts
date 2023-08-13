/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./oas.js";
export * from "./operations.js";
export * from "./service.js";

export type Logger = {
	debug: (...args: any[]) => void;
	warn: (...args: any[]) => void;
};
