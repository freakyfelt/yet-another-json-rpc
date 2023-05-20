import type { OpenAPIV3_1 } from "openapi-types";

import type { HttpMethod, ReferenceObject, SchemaObject } from "./oas.js";
import { ServiceComponentsObject } from "./service.js";

/**
 * @example
 * {
 *   operationId: "CreateWidget",
 *   type: "mutation",
 *   method: "post",
 *   path: "/users/{userId}/widgets",
 *   request: {
 *     schema: { $ref: "#/components/schemas/CreateWidgetRequest" },
 *     parameters: {
 *       userId: {
 *        in: "path",
 *     },
 *    },
 * }
 *
 */
export interface CompleteOperationDefinition extends ReducedOperationObject {
	type: "query" | "mutation";
	operationId: string;

	method: HttpMethod;
	path: string;
	request: RequestDefinition<SchemaObject>;
	response: ResponseDefinition<string>;
}

export interface OperationDefinition<
	TComponents extends ServiceComponentsObject = ServiceComponentsObject
> extends ReducedOperationObject {
	type: "query" | "mutation";
	operationId: string;

	method?: HttpMethod;
	path?: string;
	request?: ReferenceObject | RequestDefinition<TComponents["schemas"][string]>;
	response:
		| ReferenceObject
		| ResponseDefinition<keyof TComponents["schemas"] & string>;
	errors?: Array<
		| keyof TComponents["errors"]
		| ResponseDefinition<keyof TComponents["schemas"] & string>
	>;
}

/**
 * QueryDefinition defines the shape of a read-only query operation
 */
export interface QueryDefinition<
	TComponents extends ServiceComponentsObject = ServiceComponentsObject
> extends OperationDefinition<TComponents> {
	type: "query";
}

/**
 * MutationDefinition defines the shape of a mutation operation
 */
export interface MutationDefinition<
	TComponents extends ServiceComponentsObject = ServiceComponentsObject
> extends OperationDefinition<TComponents> {
	type: "mutation";
}

/**
 * RequestDefinition defines the shape of an incoming request
 *
 * @example
 * {
 *   schema: { $ref: "#/components/schemas/MySchema" },
 *   parameters: {
 *      userId: {
 *        in: "path",
 *         required: true,
 *         schema: { type: "string" },
 *      },
 *   },
 * }
 */
export type RequestDefinition<TSchema extends SchemaObject> = {
	schema: string;
	parameters?: {
		[field in keyof TSchema["properties"]]: ReducedParameterObject;
	};
};

/**
 * ResponseDefinition defines the shape of an outgoing response
 *
 * @example
 * {
 *   description: "Created",
 *   schema: 'CreateWidgetResponse',
 *   statusCode: 201,
 * }
 *
 * resulting OpenAPI definition:
 *
 * {
 *   "201": {
 *     "description": "Created",
 *     "content": {
 *       "application/json": {
 *       "schema": { "$ref": "#/components/schemas/CreateWidgetResponse" },
 *     },
 *   },
 * }
 */
export interface ResponseDefinition<TSchema extends string = string> {
	description?: string;
	schema: TSchema;
	statusCode?: number;

	oas?: OpenAPIV3_1.MediaTypeObject;
}

type ReducedOperationObject = Omit<OpenAPIV3_1.OperationObject, "parameters">;
/**
 * ReducedParameterObject removes the requirement for a name
 */
type ReducedParameterObject = Omit<OpenAPIV3_1.ParameterObject, "name">;
