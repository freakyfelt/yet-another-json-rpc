import type { OpenAPIV3_1 } from "openapi-types";

export const HttpMethods = [
	"get",
	"post",
	"put",
	"delete",
	"patch",
	"head",
	"options",
] as const;

export type HttpMethod = (typeof HttpMethods)[number];

export type MediaTypeObject = OpenAPIV3_1.MediaTypeObject;
export type OperationObject = OpenAPIV3_1.OperationObject;
export type ParameterObject = OpenAPIV3_1.ParameterObject;

export type ReferenceObject = OpenAPIV3_1.ReferenceObject;
export function isReferenceObject(
	obj: ReferenceObject | SchemaObject
): obj is ReferenceObject {
	return "$ref" in obj;
}

export type ResponseObject = OpenAPIV3_1.ResponseObject;
export type ResponsesObject = OpenAPIV3_1.ResponsesObject;
export type SchemaObject = OpenAPIV3_1.SchemaObject;

export type ObjectTypeSchema = SchemaObject & {
	type: "object";
	properties: Record<string, SchemaObject | ReferenceObject>;
};

export function assertObjectTypeSchema(
	schema: SchemaObject,
	msg?: string
): asserts schema is ObjectTypeSchema {
	if (schema.type !== "object") {
		throw new Error(msg ?? "Expected schema to be an object");
	}
	if (!schema.properties) {
		throw new Error(msg ?? "Expected schema to have properties");
	}
}

export interface OASDocument<
	TComponents extends ComponentsObject = ComponentsObject
> extends Omit<OpenAPIV3_1.Document, "components"> {
	components: TComponents;
}

export interface ComponentsObject
	extends Omit<OpenAPIV3_1.ComponentsObject, "schemas"> {
	schemas: Record<string, SchemaObject>;
}
