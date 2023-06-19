import {
	OperationObject,
	ParameterObject,
	RPCParameterLocation,
	RPCParameterObject,
	RPCParametersObject,
	ReferenceObject,
	SchemaObject,
	assertObjectTypeSchema,
} from "../types/index.js";

export type TransformOutput = Pick<
	OperationObject,
	"requestBody" | "parameters"
>;
export type ParameterDefaults = RPCParameterObject & {
	in: RPCParameterLocation;
};

/**
 * transformRPCInputs takes an RPC input schema and transforms it into an OpenAPI requestBody and parameters
 *
 * @example
 * ```typescript
 * const inputSchema = schemas.CreateWidgetInput;
 * const defaults = { in: 'body' };
 * const overrides = {
 *   userId: { in: 'path', required: true },
 * };
 * > transformRPCInputs(inputSchema, defaults, overrides);
 * {
 *   requestBody: {
 *     required: true,
 *     content: {
 *       'application/json': {
 *         schema: {
 *           type: 'object',
 *           required: ['status'],
 *           properties: {
 *             status: schemas.CreateWidgetInput.properties.status,
 *           },
 *         },
 *       },
 *     },
 *   },
 *   parameters: [
 *     {
 *       name: 'userId',
 *       in: 'path',
 *       required: true,
 *       schema: schemas.CreateWidgetInput.properties.userId,
 *     },
 *   ],
 * }
 * ```
 *
 * @param inputSchema
 * @param defaults values to use for parameters that are not overridden, primarily the `in` location
 * @param overrides
 * @returns
 */
export function transformRPCInputs(
	schemaOrRef: SchemaObject | ReferenceObject,
	inputSchema: SchemaObject,
	defaults: ParameterDefaults,
	overrides: RPCParametersObject = {}
): TransformOutput {
	assertObjectTypeSchema(
		inputSchema,
		"input schema must be an object type with properties"
	);

	if (Object.keys(overrides).length === 0 && defaults.in === "body") {
		// easy case, no overrides and the input is a body
		return {
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: schemaOrRef,
					},
				},
			},
		};
	}

	let hasParameters = false;
	let hasBody = false;
	const parameters: ParameterObject[] = [];
	const bodySchema: SchemaObject = {
		type: "object",
		properties: {},
		required: [],
	};

	for (const [name, schema] of Object.entries(inputSchema.properties)) {
		const location = overrides[name]?.in ?? defaults.in;
		if (location === "body") {
			hasBody ||= true;

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			bodySchema.properties![name] = schema;
			if (inputSchema.required?.includes(name)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				bodySchema.required!.push(name);
			}
		} else {
			hasParameters ||= true;

			parameters.push({
				name,
				// @ts-expect-error tsc thinks that "body" is still an option
				in: location,
				schema,
				...(inputSchema.required?.includes(name) ? { required: true } : {}),
				...overrides[name],
			});
		}
	}

	if (!hasBody && !hasParameters) {
		return {};
	} else if (!hasBody) {
		return { parameters };
	} else {
		const requestBody = {
			required: true,
			content: {
				"application/json": {
					schema: bodySchema,
				},
			},
		};

		return { requestBody, parameters };
	}
}
