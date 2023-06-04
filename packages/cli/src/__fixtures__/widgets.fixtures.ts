import {
	ComponentsObject,
	MutationOperationObject,
	OperationObject,
	QueryOperationObject,
} from "../types";
import { schemas } from "./schemas.js";

const createWidget: MutationOperationObject = {
	description: "Create a widget",
	input: {
		schema: {
			$ref: "#/components/schemas/CreateWidgetInput",
		},
	},
	output: {
		schema: {
			$ref: "#/components/schemas/Widget",
		},
	},
	errors: {
		400: {
			$ref: "#/components/responses/BadRequest",
		},
	},
};

export const createWidgetOAS: OperationObject = {
	operationId: "createWidget",
	description: createWidget.description,
	requestBody: {
		required: true,
		content: {
			"application/json": {
				schema: { $ref: "#/components/schemas/CreateWidgetInput" },
			},
		},
	},
	responses: {
		200: {
			description: "OK",
			content: {
				"application/json": {
					schema: { $ref: "#/components/schemas/Widget" },
				},
			},
		},
		400: {
			$ref: "#/components/responses/BadRequest",
		},
	},
};

const listUserWidgets: QueryOperationObject = {
	description: "List widgets for a user",
	input: {
		schema: {
			$ref: "#/components/schemas/ListUserWidgetsInput",
		},
	},
	output: {
		schema: {
			$ref: "#/components/schemas/ListWidgetsOutput",
		},
	},
	errors: {
		400: {
			$ref: "#/components/responses/BadRequest",
		},
	},
};

export const listUserWidgetsOAS: OperationObject = {
	operationId: "listUserWidgets",
	description: listUserWidgets.description,
	parameters: [
		{
			name: "userId",
			in: "query",
			required: true,
			schema: schemas.ListUserWidgetsInput.properties.userId,
		},
		{
			name: "status",
			in: "query",
			schema: schemas.ListUserWidgetsInput.properties.status,
		},
		{
			name: "limit",
			in: "query",
			schema: schemas.ListUserWidgetsInput.properties.limit,
		},
	],
	responses: {
		200: {
			description: "OK",
			content: {
				"application/json": {
					schema: { $ref: "#/components/schemas/ListWidgetsOutput" },
				},
			},
		},
		400: {
			$ref: "#/components/responses/BadRequest",
		},
	},
};

export const operations = {
	createWidget,
	listUserWidgets,
};

export const queries = {
	listUserWidgets,
};

export const mutations = {
	createWidget,
};

export const widgetPaths = {
	"/mutations/createWidget": {
		post: createWidgetOAS,
	},
	"/queries/listUserWidgets": {
		get: listUserWidgetsOAS,
	},
};

export const components: ComponentsObject = {
	schemas,
	responses: {
		BadRequest: {
			description: "Bad request",
		},
	},
};
