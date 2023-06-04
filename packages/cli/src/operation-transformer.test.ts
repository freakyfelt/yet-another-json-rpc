import safeGet from "just-safe-get";
import assert from "node:assert";
import test from "node:test";
import {
	components,
	createWidgetOAS,
	listUserWidgetsOAS,
	operations,
} from "./__fixtures__/widgets.fixtures.js";
import { OperationTransformer } from "./operation-transformer.js";
import { ReferenceObject, SchemaObject } from "./types/oas.js";

const resolver = {
	resolve: (ref: ReferenceObject) => {
		const path = ref.$ref.replace("#/components/", "").split("/");
		const schema = safeGet(components, path) as SchemaObject;
		if (!schema) {
			throw new Error(`Could not resolve ${ref.$ref}`);
		}

		return schema;
	},
};
const transformer = new OperationTransformer({ resolver });

test("OperationTransformer#transformMutationOperation", (t) => {
	t.test("transforms a mutation operation", () => {
		assert.deepStrictEqual(
			transformer.transformMutationOperation(
				"createWidget",
				operations.createWidget
			),
			createWidgetOAS
		);
	});
});

test("OperationTransformer#transformQueryOperation", async (t) => {
	await t.test("transforms a query operation", async () => {
		const actual = await transformer.transformQueryOperation(
			"listUserWidgets",
			operations.listUserWidgets
		);
		assert.deepStrictEqual(actual, listUserWidgetsOAS);
	});
});
