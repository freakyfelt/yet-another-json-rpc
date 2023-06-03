import safeGet from "just-safe-get";
import assert from "node:assert";
import test from "node:test";
import {
	components,
	operations,
	schemas,
} from "./__fixtures__/widgets.fixtures.js";
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

test("OperationTransformer#transformQueryOperation", async (t) => {
	await t.test("transforms a query operation", async () => {
		const expected: OperationObject = {
			operationId: "listUserWidgets",
			description: "List widgets for a user",
			parameters: [
				{
					name: "userId",
					in: "query",
					required: true,
					schema: schemas.ListUserWidgetsInput.properties.userId,
				},
				{
					name: "status",
					in: "query",
					schema: schemas.ListUserWidgetsInput.properties.status,
				},
				{
					name: "limit",
					in: "query",
					// @ts-expect-error not sure why this is failing
					schema: schemas.ListUserWidgetsInput.properties.limit,
				},
			],
			responses: {
				200: {
					description: "OK",
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/ListWidgetsOutput" },
						},
					},
				},
				400: {
					$ref: "#/components/responses/BadRequest",
				},
			},
		};

		const actual = await transformer.transformQueryOperation(
			"listUserWidgets",
			operations.listUserWidgets
		);
		assert.deepStrictEqual(actual, expected);
	});
});
