import assert from "node:assert";
import test from "node:test";
import {
	components,
	mutations,
	paths,
	queries,
} from "./__fixtures__/widgets.fixtures.js";
import { DocumentTransformer } from "./document-transformer.js";
import { OASDocument, RPCDocument } from "./types";

const rpcDocument: RPCDocument = {
	yarpc: "1.0.0",
	info: {
		title: "Widgets API",
		version: "1.0.0",
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
	paths,
	components: rpcDocument.components,
};

const transformer = new DocumentTransformer(rpcDocument);

test("DocumentTransformer#transform", async (t) => {
	await t.test("transforms an RPC document into an OAS document", async () => {
		const actual = await transformer.transform();
		assert.deepStrictEqual(actual, oasDocument);
	});
});
