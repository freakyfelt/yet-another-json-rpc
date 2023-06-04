import assert from "node:assert";
import test from "node:test";
import {
	components,
	mutations,
	queries,
	widgetPaths,
} from "./__fixtures__/widgets.fixtures.js";
import { DocumentTransformer } from "./document-transformer.js";
import { OASDocument, RPCDocument } from "./types";

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

const transformer = new DocumentTransformer(rpcDocument);

test("DocumentTransformer#transform", async (t) => {
	await t.test("transforms an RPC document into an OAS document", async () => {
		const actual = await transformer.transform();
		assert.deepStrictEqual(actual, oasDocument);
	});

	await t.test("throws an error if the YARPC version is missing", async () => {
		const doc = { ...rpcDocument };
		// @ts-expect-error Missing required yarpc version
		delete doc.yarpc;
		const transformer = new DocumentTransformer(doc);
		await assert.rejects(transformer.transform(), {
			message: "Missing required yarpc version",
		});
	});

	await t.test(
		"throws an error if the YARPC version is not supported",
		async () => {
			const doc = { ...rpcDocument };
			// @ts-expect-error incorrect yarpc version
			doc.yarpc = "2.0.0";
			const transformer = new DocumentTransformer(doc);
			await assert.rejects(transformer.transform(), {
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

		const transformer = new DocumentTransformer(doc);
		const actual = await transformer.transform();
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

		const transformer = new DocumentTransformer(doc);
		const actual = await transformer.transform();
		assert.deepStrictEqual(actual, oasDocument);
	});
});
