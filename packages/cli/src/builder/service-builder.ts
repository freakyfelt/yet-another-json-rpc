import assert from "node:assert";
import {
	OperationDefinition,
	ServiceComponentsObject,
	ServiceDefinition,
} from "../types/index.js";
import {
	AddMutationDefinition,
	AddQueryDefinition,
	withMutationDefaults,
	withQueryDefaults,
} from "./utils.js";

export class YARPCServiceBuilder<
	TBase extends ServiceDefinition<ServiceComponentsObject>
> {
	#service: ServiceDefinition<TBase["components"]>;
	#operations: Map<string, OperationDefinition<TBase["components"]>> =
		new Map();

	constructor(config: ServiceDefinition<TBase["components"]>) {
		this.#service = config;
	}

	get operations(): Record<string, OperationDefinition<TBase["components"]>> {
		return Object.fromEntries(this.#operations.entries());
	}

	addQuery(
		operationId: string,
		operation: AddQueryDefinition<TBase["components"]>
	) {
		assert(
			!this.#operations.has(operationId),
			`Operation with id "${operationId}" already exists`
		);

		this.#operations.set(
			operationId,
			Object.freeze(withQueryDefaults(operationId, operation))
		);
	}

	addMutation(
		operationId: string,
		operation: AddMutationDefinition<TBase["components"]>
	) {
		assert(
			!this.#operations.has(operationId),
			`Operation with id "${operationId}" already exists`
		);

		this.#operations.set(
			operationId,
			Object.freeze(withMutationDefaults(operationId, operation))
		);
	}
}
