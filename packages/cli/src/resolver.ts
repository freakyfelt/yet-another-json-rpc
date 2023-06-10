import safeGet from "just-safe-get";
import { RPCDocument, ReferenceObject, SchemaObject } from "./types/index.js";

export type IRefResolver = {
	resolve(ref: ReferenceObject): SchemaObject | PromiseLike<SchemaObject>;
};

export const getDefaultRefResolver = (doc: RPCDocument): IRefResolver => ({
	resolve: (ref: ReferenceObject) => {
		if (!ref.$ref.startsWith("#/components/")) {
			throw new Error(`Unsupported reference ${ref.$ref}`);
		}
		const path = ref.$ref.split("/").slice(1);
		const schema = safeGet(doc, path) as SchemaObject;
		if (!schema) {
			throw new Error(`Could not resolve ${ref.$ref}`);
		}

		return schema;
	},
});
