import type { ComponentsObject, OASDocument } from "./oas.js";
import type {
	MutationOperationObject,
	QueryOperationObject,
} from "./operations.js";

export interface RPCDocument<
	TComponents extends ComponentsObject = ComponentsObject
> extends OASDocument<TComponents> {
	queries: Record<string, QueryOperationObject>;
	mutations: Record<string, MutationOperationObject>;
}
