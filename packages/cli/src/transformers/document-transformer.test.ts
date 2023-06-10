import assert from "node:assert";
import test from "node:test";
import pino from "pino";
import {
	components,
	mutations,
	queries,
	widgetPaths,
} from "../__fixtures__/widgets.fixtures.js";
import { OASDocument, RPCDocument } from "../types/index.js";
import { DocumentTransformer } from "./document-transformer.js";

const logger = pino({ level: "silent" });

const healthCheck = {
	"/health": {
		get: {
			operationId: "health",
			description: "Health check",
			responses: {
				200: {
					description: "OK",
				},
			},
		},
	},
};

const conflictingPathName = Object.keys(
	widgetPaths
)[0] as keyof typeof widgetPaths;
const conflictingPathMethod = Object.keys(widgetPaths[conflictingPathName])[0];

const conflictingPathOperation = {
	operationId: "conflictingPathOperation",
	responses: {
		200: {
			description: "OK",
		},
		409: {
			description: "CONFLICT",
		},
	},
};

const rpcDocument: RPCDocument = {
	yarpc: "1.0.0",
	info: {
		title: "Widgets API",
		version: "1.0.0",
	},
	paths: {
		...healthCheck,
	},
	operations: {
		queries,
		mutations,
	},
	components,
};

const oasDocument: OASDocument = {
	openapi: "3.1.0",
	info: rpcDocument.info,
	paths: {
		...healthCheck,
		...widgetPaths,
	},
	components: rpcDocument.components,
};

test("DocumentTransformer#transform", async (t) => {
	await t.test("transforms an RPC document into an OAS document", async () => {
		const actual = await DocumentTransformer.transform(rpcDocument, { logger });
		assert.deepStrictEqual(actual, oasDocument);
	});

	await t.test("throws an error if the YARPC version is missing", async () => {
		const doc = { ...rpcDocument };
		// @ts-expect-error Missing required yarpc version
		delete doc.yarpc;
		await assert.rejects(DocumentTransformer.transform(doc, { logger }), {
			message: "Missing required yarpc version",
		});
	});

	await t.test(
		"throws an error if the YARPC version is not supported",
		async () => {
			const doc = { ...rpcDocument };
			// @ts-expect-error incorrect yarpc version
			doc.yarpc = "2.0.0";
			await assert.rejects(DocumentTransformer.transform(doc, { logger }), {
				message: "Unsupported YARPC version: 2.0.0",
			});
		}
	);

	await t.test("merge same path different HTTP method", async () => {
		const doc = {
			...rpcDocument,
			paths: {
				...rpcDocument.paths,
				[conflictingPathName]: {
					patch: conflictingPathOperation,
				},
			},
		};

		const expected = {
			...oasDocument,
			paths: {
				...oasDocument.paths,
				[conflictingPathName]: {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					...oasDocument.paths![conflictingPathName],
					patch: conflictingPathOperation,
				},
			},
		};

		const actual = await DocumentTransformer.transform(doc, { logger });
		assert.deepStrictEqual(actual, expected);
	});

	await t.test("merge same path+HTTP method", async () => {
		const doc = {
			...rpcDocument,
			paths: {
				...rpcDocument.paths,
				[conflictingPathName]: {
					[conflictingPathMethod]: conflictingPathOperation,
				},
			},
		};

		const actual = await DocumentTransformer.transform(doc, { logger });
		assert.deepStrictEqual(actual, oasDocument);
	});

	await t.test("override query method and path", async () => {
		const doc = {
			...rpcDocument,
			operations: {
				queries: {
					deepHealthCheck: {
						method: "post",
						path: "/health/deep",

						output: {
							description: "No content",
							statusCode: 204,
						},
					},
				},
			},
		} as const;

		const expected = {
			...oasDocument,
			paths: {
				...oasDocument.paths,
				"/health/deep": {
					post: {
						operationId: "deepHealthCheck",
						responses: {
							204: { description: "No content" },
						},
					},
				},
			},
		};

		const actual = await DocumentTransformer.transform(doc, { logger });
		assert.deepStrictEqual(actual, expected);
	});
});
