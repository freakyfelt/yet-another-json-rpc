import {
	MediaTypeObject,
	ParameterObject as OASParameterObject,
	OperationObject,
	ResponsesObject,
} from "./oas.js";

export type RPCParameterObject = Partial<OASParameterObject>;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RPCOutputObject extends MediaTypeObject {}

export interface RPCOperationObject
	extends Omit<OperationObject, "operationId" | "requestBody" | "responses"> {
	input?: MediaTypeObject;
	/**
	 * The response for the query operation
	 *
	 * NOTE: Optional for cases where the response is empty
	 */
	output?: RPCOutputObject;
	/**
	 * The OpenAPI error responses that that can be returned by the query operation
	 * mapped to their HTTP status code
	 */
	errors?: ResponsesObject;
}

/**
 * QueryOperationObject defines the shape of a query operation
 *
 * @example
 * ```yaml
 * input:
 * 	 schema:
 * 		 $ref: '#/components/schemas/MyQueryInput'
 * output:
 * 	 schema:
 * 		 $ref: '#/components/schemas/MyQueryOutput'
 * errors:
 * 	 400:
 * 		 $ref: '#/components/responses/BadRequest'
 *   429:
 *     description: Too many requests
 *     headers:
 *       Retry-After:
 *         schema: { type: 'integer' }
 *     content:
 *       application/json:
 *         schema: { $ref: '#/components/schemas/Error' }
 * ```
 *
 * @todo add support for overriding the HTTP method
 * @todo add support for overriding the path
 *
 */
export interface QueryOperationObject extends RPCOperationObject {
	/**
	 * The input object for the query operation
	 *
	 * NOTE: Optional if no input arguments are required
	 */
	input?: QueryInputObject;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface QueryInputObject extends MediaTypeObject {
	/**
	 * Allows for optional overriding of the location of specific parameters
	 */
	parameters?: Record<string, RPCParameterObject>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MutationOperationObject extends RPCOperationObject {}
