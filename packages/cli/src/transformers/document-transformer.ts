import intersect from "just-intersect";
import { IRefResolver, getDefaultRefResolver } from "../resolver.js";
import {
	Logger,
	OASDocument,
	PathsObject,
	RPCDocument,
} from "../types/index.js";
import { OperationTransformer } from "./operation-transformer.js";

type TransformerOptions = {
	logger?: Logger;
	/** specify a different schema $ref resolver */
	refResolver?: IRefResolver;
	/** use this operation transformer instead */
	operationTransformer?: OperationTransformer;
};

/**
 * Transforms an RPC document into an OAS document
 */
export class DocumentTransformer {
	static transform(
		doc: RPCDocument,
		opts: TransformerOptions = {}
	): Promise<OASDocument> {
		return new DocumentTransformer(doc, opts).transform();
	}

	private doc: RPCDocument;
	private operationTransformer: OperationTransformer;
	private logger?: Logger;

	constructor(doc: RPCDocument, opts: TransformerOptions = {}) {
		this.doc = doc;
		this.logger = opts.logger;

		this.operationTransformer =
			opts.operationTransformer ??
			new OperationTransformer({
				logger: this.logger ?? console,
				resolver: opts.refResolver ?? getDefaultRefResolver(doc),
			});
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

	private async rpcToPaths(
		rpc: RPCDocument["operations"]
	): Promise<PathsObject> {
		const paths: PathsObject = {};

		for (const [operationId, operation] of Object.entries(rpc.queries ?? {})) {
			const httpMethod = operation.method ?? "get";
			const path = operation.path ?? `/queries/${operationId}`;
			this.logger?.debug(
				{ operationId, httpMethod, operation, path },
				"Transforming query"
			);

			paths[path] = {
				[httpMethod]: await this.operationTransformer.transformQueryOperation(
					operationId,
					operation
				),
			};
		}

		for (const [operationId, operation] of Object.entries(
			rpc.mutations ?? {}
		)) {
			const httpMethod = operation.method ?? "post";
			const path = operation.path ?? `/mutations/${operationId}`;
			this.logger?.debug(
				{ operationId, httpMethod, operation, path },
				"Transforming mutation"
			);

			paths[path] = {
				[httpMethod]:
					await this.operationTransformer.transformMutationOperation(
						operationId,
						operation
					),
			};
		}

		return paths;
	}

	private deepMergePaths(
		paths: PathsObject,
		otherPaths: PathsObject
	): PathsObject {
		this.logger?.debug({ paths, otherPaths }, "Merging paths");

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
				this.logger?.warn(
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
