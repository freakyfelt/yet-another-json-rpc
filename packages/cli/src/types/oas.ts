import type {} from "node:http";
import type { OpenAPIV3_1 } from "openapi-types";

export type HttpMethod =
	| "get"
	| "post"
	| "put"
	| "delete"
	| "patch"
	| "head"
	| "options";

export type ReferenceObject = OpenAPIV3_1.ReferenceObject;
export type SchemaObject = OpenAPIV3_1.SchemaObject;

export interface OASDocument<
	TComponents extends ComponentsObject = ComponentsObject
> extends Omit<OpenAPIV3_1.Document, "components"> {
	components: TComponents;
}

export interface ComponentsObject
	extends Omit<OpenAPIV3_1.ComponentsObject, "schemas"> {
	schemas: Record<string, OpenAPIV3_1.SchemaObject>;
}
