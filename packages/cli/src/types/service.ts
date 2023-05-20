import type { ComponentsObject, OASDocument } from "./oas.js";
import type { ResponseDefinition } from "./operations.js";

type ReducedOASDocument = Omit<OASDocument<never>, "openapi" | "components">;

export interface ServiceDefinition<
	TComponents extends ServiceComponentsObject = ServiceComponentsObject
> extends ReducedOASDocument {
	components: TComponents;
	oas?: Record<string, unknown>;
}

export interface ServiceComponentsObject extends ComponentsObject {
	/**
	 * @example
	 * {
	 *   NotFound: {
	 *     description: "The requested resource was not found",
	 *     statusCode: 404,
	 *     schema: { $ref: "#/components/schemas/Error" },
	 *   }
	 * }
	 */
	errors?: Record<string, ResponseDefinition<string>>;
}
