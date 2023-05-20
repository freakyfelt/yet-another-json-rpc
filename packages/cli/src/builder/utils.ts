import { ComponentsObject } from "../types/oas";
import {
	MutationDefinition,
	OperationDefinition,
	QueryDefinition,
} from "../types/operations";

export type AddQueryDefinition<TComponents extends ComponentsObject> = Omit<
	QueryDefinition<TComponents>,
	"operationId" | "type"
>;

export const withQueryDefaults = <TComponents extends ComponentsObject>(
	operationId: string,
	def: AddQueryDefinition<TComponents>
): OperationDefinition<TComponents> => ({
	type: "query",
	operationId,
	method: "get",
	path: "/queries/" + operationId,
	response: {
		statusCode: 200,
		...def.response,
	},
});

export type AddMutationDefinition<TComponents extends ComponentsObject> = Omit<
	MutationDefinition<TComponents>,
	"operationId" | "type"
>;

export const withMutationDefaults = <TComponents extends ComponentsObject>(
	operationId: string,
	def: AddMutationDefinition<TComponents>
): OperationDefinition<TComponents> => ({
	type: "mutation",
	operationId,
	method: "post",
	path: "/mutations/" + operationId,
	response: {
		statusCode: 200,
		...def.response,
	},
});
