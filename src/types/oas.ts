import type {
	ComponentsObject,
	OpenAPIObject,
	ReferenceObject,
	SchemaObject,
} from "openapi3-ts/oas31";
export type {
	ComponentsObject,
	MediaTypeObject,
	OperationObject,
	ParameterObject,
	PathsObject,
	ReferenceObject,
	ResponseObject,
	ResponsesObject,
	SchemaObject,
} from "openapi3-ts/oas31";

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

export function isReferenceObject(
	obj: ReferenceObject | SchemaObject,
): obj is ReferenceObject {
	return "$ref" in obj;
}

export type ObjectTypeSchema = SchemaObject & {
	type: "object";
	properties: Record<string, SchemaObject | ReferenceObject>;
};

export function assertObjectTypeSchema(
	schema: SchemaObject,
	msg?: string,
): asserts schema is ObjectTypeSchema {
	if (schema.type !== "object") {
		throw new Error(msg ?? "Expected schema to be an object");
	}
	if (!schema.properties) {
		throw new Error(msg ?? "Expected schema to have properties");
	}
}

export interface OASDocument<
	TComponents extends ComponentsObject = ComponentsObject,
> extends Omit<OpenAPIObject, "components"> {
	components: TComponents;
}
