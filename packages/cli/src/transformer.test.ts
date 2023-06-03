import safeGet from "just-safe-get";
import assert from "node:assert";
import test from "node:test";
import { components, operations } from "./__fixtures__/widgets.fixtures.js";
import { OperationTransformer } from "./transformer.js";
import { OperationObject, ReferenceObject, SchemaObject } from "./types/oas.js";

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
		const expected: OperationObject = {
			operationId: "createWidget",
			description: "Create a widget",
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/CreateWidgetInput" },
					},
				},
			},
			responses: {
				200: {
					description: "OK",
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/Widget" },
						},
					},
				},
				400: {
					$ref: "#/components/responses/BadRequest",
				},
			},
		};

		assert.deepStrictEqual(
			transformer.transformMutationOperation(
				"createWidget",
				operations.createWidget
			),
			expected
		);
	});
});
