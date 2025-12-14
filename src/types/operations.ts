import { ParameterLocation } from "openapi3-ts/oas31";
import {
	HttpMethod,
	MediaTypeObject,
	ParameterObject as OASParameterObject,
	OperationObject,
	ResponsesObject,
} from "./oas.js";

export type RPCParameterLocation = ParameterLocation | "body";

export type RPCParametersObject = Record<string, RPCParameterObject>;
export type RPCParameterObject = Omit<
	OASParameterObject,
	"in" | "name" | "schema"
> & {
	in?: RPCParameterLocation;
};

export interface RPCInputObject extends MediaTypeObject {
	/**
	 * Allows for optional overriding of the location of specific parameters
	 *
	 * @example
	 * ```yaml
	 * input:
	 *   schema: { $ref: '#/components/schemas/MyMutationInput' }
	 *   parameters:
	 *     arg1:
	 *       in: path
	 *       required: true
	 */
	parameters?: RPCParametersObject;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RPCOutputObject extends MediaTypeObject {
	/**
	 * Description of what success means for this operation
	 *
	 * This field will be mapped to the `description` field of the `200` response
	 */
	description?: string;
	/**
	 * Allows for overriding the default "200" status code
	 */
	statusCode?: number;
}

export interface RPCOperationObject extends Omit<
	OperationObject,
	"operationId" | "requestBody" | "responses"
> {
	method?: HttpMethod;
	path?: string;

	/**
	 * The input object for the operation
	 *
	 * NOTE: Optional if no input arguments are required
	 */
	input?: RPCInputObject;

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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface QueryOperationObject extends RPCOperationObject {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MutationOperationObject extends RPCOperationObject {}
