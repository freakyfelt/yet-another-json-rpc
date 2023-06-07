import assert from "node:assert";
import { IResolver } from "../resolver.js";
import {
	MutationOperationObject,
	OperationObject,
	QueryOperationObject,
	RPCInputObject,
	RPCOperationObject,
	RPCOutputObject,
	ResponseObject,
	ResponsesObject,
	isReferenceObject,
} from "../types/index.js";
import {
	ParameterDefaults,
	TransformOutput,
	transformRPCInputs,
} from "./parameter-transformer.js";

const DEFAULT_RESPONSE: ResponseObject = {
	description: "OK",
};

type TransformerDeps = {
	resolver: IResolver;
};

export class OperationTransformer {
	resolver: IResolver;

	constructor({ resolver }: TransformerDeps) {
		this.resolver = resolver;
	}

	async transformMutationOperation(
		operationId: string,
		operation: MutationOperationObject
	): Promise<OperationObject> {
		return this.transformOperation(operationId, operation, { in: "body" });
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
		return this.transformOperation(operationId, operation, { in: "query" });
	}

	private async transformOperation(
		operationId: string,
		operation: RPCOperationObject,
		parameterDefaults: ParameterDefaults
	): Promise<OperationObject> {
		const { description, input, output, errors, ...rest } = operation;
		const transformedInputs = input
			? await this.transformInput(input, parameterDefaults)
			: undefined;
		const responses = this.transformOperationResponses(output, errors);

		return {
			operationId,
			description,
			...transformedInputs,
			responses,
			...rest,
		};
	}

	private async transformInput(
		input: RPCInputObject,
		defaults: ParameterDefaults
	): Promise<TransformOutput> {
		const { schema: schemaOrRef, parameters: parameterOverrides = {} } = input;
		assert(
			typeof schemaOrRef === "object",
			"Query input schema must be an object"
		);

		const inputSchema = isReferenceObject(schemaOrRef)
			? await this.resolver.resolve(schemaOrRef)
			: schemaOrRef;

		return transformRPCInputs(inputSchema, defaults, parameterOverrides);
	}

	private transformOperationResponses(
		output: RPCOutputObject = {},
		errors: ResponsesObject = {}
	): OperationObject["responses"] {
		const { description = "OK", statusCode = 200, ...mediaType } = output;

		const successResponse =
			Object.keys(mediaType).length > 0
				? {
						description,
						content: {
							"application/json": mediaType,
						},
				  }
				: DEFAULT_RESPONSE;

		return {
			[statusCode]: successResponse,
			...errors,
		};
	}
}
