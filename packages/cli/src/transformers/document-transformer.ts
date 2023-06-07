import intersect from "just-intersect";
import { getDefaultResolver } from "../resolver.js";
import {
	Logger,
	OASDocument,
	PathsObject,
	RPCDocument,
} from "../types/index.js";
import { OperationTransformer } from "./operation-transformer.js";

/**
 * Transforms an RPC document into an OAS document
 */
export class DocumentTransformer {
	private doc: RPCDocument;
	private transformer: OperationTransformer;
	private logger: Logger;

	constructor(doc: RPCDocument) {
		this.doc = doc;
		this.transformer = new OperationTransformer({
			resolver: getDefaultResolver(doc),
		});
		this.logger = console;
	}

	async transform(): Promise<OASDocument> {
		const { info, paths: oasPaths = {}, operations, yarpc, ...rest } = this.doc;

		if (typeof yarpc !== "string") {
			throw new Error("Missing required yarpc version");
		}

		if (yarpc !== "1.0.0") {
			throw new Error(`Unsupported YARPC version: ${String(yarpc)}`);
		}

		const rpcPaths = await this.rpcToPaths(operations);

		const paths = this.deepMergePaths(oasPaths, rpcPaths);

		return {
			openapi: "3.1.0",
			info,
			paths,
			...rest,
		};
	}

	async rpcToPaths(rpc: RPCDocument["operations"]): Promise<PathsObject> {
		const paths: PathsObject = {};

		for (const [operationId, operation] of Object.entries(rpc.queries ?? {})) {
			const httpMethod = operation.method ?? "get";

			paths[operation.path ?? `/queries/${operationId}`] = {
				[httpMethod]: await this.transformer.transformQueryOperation(
					operationId,
					operation
				),
			};
		}

		for (const [operationId, operation] of Object.entries(
			rpc.mutations ?? {}
		)) {
			const httpMethod = operation.method ?? "post";

			paths[operation.path ?? `/mutations/${operationId}`] = {
				[httpMethod]: await this.transformer.transformMutationOperation(
					operationId,
					operation
				),
			};
		}

		return paths;
	}

	deepMergePaths(paths: PathsObject, otherPaths: PathsObject): PathsObject {
		const mergedPaths: PathsObject = {
			...paths,
		};

		Object.entries(otherPaths).forEach(([path, httpOperations]) => {
			// case 1: non-overlapping paths
			if (typeof mergedPaths[path] === "undefined") {
				mergedPaths[path] = httpOperations;
				return;
			}

			// detect and report overlapping path+method
			const duplicate = intersect(
				Object.keys(httpOperations),
				Object.keys(mergedPaths[path])
			);
			if (duplicate.length > 0) {
				this.logger.warn(
					{ path, duplicate },
					"Duplicate operation(s) will be overwritten"
				);
			}

			mergedPaths[path] = {
				...mergedPaths[path],
				...httpOperations,
			};
		});

		return mergedPaths;
	}
}
