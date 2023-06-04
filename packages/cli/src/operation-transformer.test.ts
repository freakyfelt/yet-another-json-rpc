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
import { ParameterObject, ReferenceObject, SchemaObject } from "./types/oas.js";

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

	await t.test(
		"adds specified overrides to the operation parameter",
		async () => {
			const actual = await transformer.transformQueryOperation(
				"listUserWidgets",
				{
					...operations.listUserWidgets,
					input: {
						...operations.listUserWidgets.input,
						parameters: {
							userId: {
								in: "path",
							},
							status: {
								deprecated: true,
								description: 'Use "statuses" instead',
							},
							nonExistent: {
								description: "This parameter does not exist in the OAS",
							},
						},
					},
				}
			);

			const expectedByName: Record<string, ParameterObject> =
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				listUserWidgetsOAS.parameters!.reduce(
					(acc, param) => ({
						...acc,
						[(param as ParameterObject).name]: param,
					}),
					{}
				);
			expectedByName.status = {
				name: "status",
				in: "query",
				description: 'Use "statuses" instead',
				deprecated: true,
				schema: {
					type: "array",
					items: {
						$ref: "#/components/schemas/WidgetStatus",
					},
				},
			};

			expectedByName.userId = {
				...expectedByName.userId,
				in: "path",
			};

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const actualByName = actual.parameters!.reduce(
				(acc, param) => ({ ...acc, [(param as ParameterObject).name]: param }),
				{}
			);

			assert.deepStrictEqual(actualByName, expectedByName);
		}
	);
});
