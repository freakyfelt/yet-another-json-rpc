import type { ComponentsObject, OASDocument } from "./oas.js";
import type {
	MutationOperationObject,
	QueryOperationObject,
} from "./operations.js";

export interface RPCDocument<
	TComponents extends ComponentsObject = ComponentsObject,
> extends Omit<OASDocument<TComponents>, "openapi"> {
	yarpc: "1.0.0";
	operations: {
		queries?: Record<string, QueryOperationObject>;
		mutations?: Record<string, MutationOperationObject>;
	};
}
