import { OperationTransformer } from "./operation-transformer.js";
import { getDefaultResolver } from "./resolver.js";
import { OASDocument, RPCDocument } from "./types/index.js";

/**
 * Transforms an RPC document into an OAS document
 */
export class DocumentTransformer {
	private doc: RPCDocument;
	private transformer: OperationTransformer;

	constructor(doc: RPCDocument) {
		this.doc = doc;
		this.transformer = new OperationTransformer({
			resolver: getDefaultResolver(doc),
		});
	}

	async transform(): Promise<OASDocument> {
		const { info, paths: oasPaths, operations, yarpc, ...rest } = this.doc;

		if (typeof yarpc !== "string") {
			throw new Error("Missing required yarpc version");
		}

		if (yarpc !== "1.0.0") {
			throw new Error(`Unsupported YARPC version: ${String(yarpc)}`);
		}

		const paths = await this.rpcToPaths(operations);

		return {
			openapi: "3.1.0",
			info,
			paths: {
				...oasPaths,
				...paths,
			},
			...rest,
		};
	}

	async rpcToPaths(
		rpc: RPCDocument["operations"]
	): Promise<OASDocument["paths"]> {
		const paths: OASDocument["paths"] = {};

		for (const [operationId, operation] of Object.entries(rpc.queries)) {
			paths[`/queries/${operationId}`] = {
				get: await this.transformer.transformQueryOperation(
					operationId,
					operation
				),
			};
		}

		for (const [operationId, operation] of Object.entries(rpc.mutations)) {
			paths[`/mutations/${operationId}`] = {
				post: this.transformer.transformMutationOperation(
					operationId,
					operation
				),
			};
		}

		return paths;
	}
}
