import safeGet from "just-safe-get";
import assert from "node:assert";
import test from "node:test";
import { schemas } from "../__fixtures__/schemas.js";
import {
	components,
	createWidgetOAS,
	listUserWidgetsOAS,
	operations,
} from "../__fixtures__/widgets.fixtures.js";
import {
	ParameterObject,
	ReferenceObject,
	SchemaObject,
} from "../types/oas.js";
import { OperationTransformer } from "./operation-transformer.js";

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

test("OperationTransformer#transformMutationOperation", async (t) => {
	await t.test("transforms a mutation operation", async () => {
		assert.deepStrictEqual(
			await transformer.transformMutationOperation(
				"createWidget",
				operations.createWidget
			),
			createWidgetOAS
		);
	});

	await t.test(
		"moves operations to the path parameters if specified",
		async () => {
			const actual = await transformer.transformMutationOperation(
				"createWidget",
				{
					...operations.createWidget,
					input: {
						...operations.createWidget.input,
						parameters: {
							userId: {
								in: "path",
							},
						},
					},
				}
			);

			const expectedParameters = [
				{
					name: "userId",
					in: "path",
					required: true,
					schema: schemas.CreateWidgetInput.properties.userId,
				},
			];
			const expectedRequestBody = {
				content: {
					"application/json": {
						schema: {
							type: "object",
							required: ["status"],
							properties: {
								status: schemas.CreateWidgetInput.properties.status,
							},
						},
					},
				},
			};

			assert.deepStrictEqual(actual.parameters, expectedParameters);
			assert.deepStrictEqual(actual.requestBody, expectedRequestBody);
		}
	);
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

	await t.test(
		"allows for overriding the successful response status code and description",
		async () => {
			const actual = await transformer.transformQueryOperation(
				"listUserWidgets",
				{
					...operations.listUserWidgets,
					method: "post",
					path: "/widgets",
					output: {
						...operations.listUserWidgets.output,
						statusCode: 418,
						description: "I'm a teapot",
					},
				}
			);

			const expectedResponseLength =
				Object.keys(listUserWidgetsOAS.responses).length + 1;
			assert.equal(Object.keys(actual.responses), expectedResponseLength);
			assert.strictEqual(actual.responses["418"], {
				description: "I'm a teapot",
				content: {
					418: {
						"application/json": operations.listUserWidgets.output,
					},
				},
			});
		}
	);
});
