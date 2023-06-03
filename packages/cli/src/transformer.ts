import assert from "node:assert";
import {
	OperationObject,
	ParameterObject,
	QueryInputObject,
	QueryOperationObject,
	RPCOutputObject,
	ReferenceObject,
	ResponseObject,
	ResponsesObject,
	SchemaObject,
	assertObjectTypeSchema,
	isReferenceObject,
} from "./types/index.js";

const DEFAULT_RESPONSE: ResponseObject = {
	description: "OK",
};

type IResolver = {
	resolve(ref: ReferenceObject): SchemaObject | PromiseLike<SchemaObject>;
};

type TransformerDeps = {
	resolver: IResolver;
};

export class OperationTransformer {
	resolver: IResolver;

	constructor({ resolver }: TransformerDeps) {
		this.resolver = resolver;
	}

	transformMutationOperation(
		operationId: string,
		operation: QueryOperationObject
	): OperationObject {
		const { description, input, output, errors, ...rest } = operation;
		const responses = this.transformOperationResponses(output, errors);

		const requestBody = input
			? {
					required: true,
					content: {
						"application/json": input,
					},
			  }
			: undefined;

		return {
			operationId,
			description,
			requestBody,
			responses,
			...rest,
		};
	}

	/**
	 * Transforms a query operation into an OpenAPI operation
	 *
	 * @example
	 * ```typescript
	 * const operation = {
	 *   description: 'My query operation',
	 *   input: {
	 *     schema: { $ref: '#/components/schemas/MyQueryInput' },
	 *   },
	 *   output: {
	 *     schema: { $ref: '#/components/schemas/MyQueryOutput' },
	 *   },
	 *   errors: {
	 *     400: { $ref: '#/components/responses/BadRequest' },
	 *   },
	 * };
	 * > transformQueryOperation('myQueryOperation', operation);
	 * {
	 *   operationId: 'myQueryOperation',
	 *   description: 'My query operation',
	 *   parameters: [
	 *     {
	 *       name: 'arg1',
	 *       in: 'query',
	 *       schema: { $ref: '#/components/schemas/MyQueryInput/properties/arg1' }
	 *     },
	 *   ],
	 *   responses: {
	 *     200: {
	 *       description: 'OK',
	 *       content: {
	 *         'application/json': {
	 *           schema: { $ref: '#/components/schemas/MyQueryOutput' },
	 *         },
	 *       },
	 *     },
	 *     400: { $ref: '#/components/responses/BadRequest' },
	 *   },
	 * };
	 */
	async transformQueryOperation(
		operationId: string,
		operation: QueryOperationObject
	): Promise<OperationObject> {
		const { description, input, output, errors, ...rest } = operation;
		const parameters = input
			? await this.transformQueryInput(input)
			: undefined;
		const responses = this.transformOperationResponses(output, errors);

		return {
			operationId,
			description,
			parameters,
			responses,
			...rest,
		};
	}

	async transformQueryInput(
		input: QueryInputObject
	): Promise<ParameterObject[]> {
		const { schema: schemaOrRef } = input;
		assert(
			typeof schemaOrRef === "object",
			"Query input schema must be an object"
		);

		const inputSchema = isReferenceObject(schemaOrRef)
			? await this.resolver.resolve(schemaOrRef)
			: schemaOrRef;
		assertObjectTypeSchema(
			inputSchema,
			"Query input schema must be an object type with properties"
		);

		// @todo support parameter overrides object

		return Object.entries(inputSchema.properties).map(([name, schema]) => ({
			name,
			in: "query",
			schema,
			...(inputSchema?.required?.includes(name) ? { required: true } : {}),
		})) as ParameterObject[];
	}

	transformOperationResponses(
		output?: RPCOutputObject,
		errors?: ResponsesObject
	): OperationObject["responses"] {
		const successResponse = output
			? {
					description: "OK",
					content: {
						"application/json": output,
					},
			  }
			: DEFAULT_RESPONSE;

		return {
			// @todo support other status codes
			200: successResponse,
			...errors,
		};
	}
}
