import { Type } from "@sinclair/typebox";
import {
	ComponentsObject,
	MutationOperationObject,
	QueryOperationObject,
} from "../types";

const withoutSymbols = <T extends object>(obj: T): T =>
	JSON.parse(JSON.stringify(obj)) as T;

const Widget = Type.Object(
	{
		id: Type.String(),
		userId: Type.String(),
		status: Type.String(),
	},
	{ $id: "Widget" }
);

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

const CreateWidgetInput = Type.Object({
	userId: Type.String(),
	status: Type.String(),
});

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

const ListUserWidgetsInput = Type.Object({
	userId: Type.String(),
	status: Type.Optional(Type.String()),
	limit: Type.Optional(Type.Integer()),
});

const ListWidgetsOutput = Type.Object({
	items: Type.Array(Type.Ref(Widget)),
	pageInfo: Type.Object({
		hasNextPage: Type.Boolean(),
		lastCursor: Type.Optional(Type.String()),
	}),
});

export const operations = {
	createWidget,
	listUserWidgets,
};

export const components: ComponentsObject = {
	schemas: withoutSymbols({
		CreateWidgetInput,
		ListUserWidgetsInput,
		ListWidgetsOutput,
		Widget,
	}),
	responses: {
		BadRequest: {
			description: "Bad request",
		},
	},
};
