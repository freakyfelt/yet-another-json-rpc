import { Type } from "@sinclair/typebox";
import {
	ComponentsObject,
	MutationOperationObject,
	QueryOperationObject,
} from "../types";

const withoutSymbols = <T extends object>(obj: T): T =>
	JSON.parse(JSON.stringify(obj)) as T;

const UserID = Type.String({
	$id: "#/components/schemas/UserID",
	description: "The user's ID",
});
const WidgetID = Type.String({
	$id: "#/components/schemas/WidgetID",
	description: "The widget's ID",
});
const WidgetStatus = Type.Union(
	[Type.Literal("ACTIVE"), Type.Literal("INACTIVE")],
	{ $id: "#/components/schemas/WidgetStatus" }
);

const Widget = Type.Object(
	{
		id: Type.Ref(WidgetID),
		userId: Type.Ref(UserID),
		status: Type.Ref(WidgetStatus),
	},
	{ $id: "#/components/schemas/Widget" }
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

const CreateWidgetInput = Type.Pick(Widget, ["userId", "status"]);

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
	userId: Type.Ref(UserID),
	status: Type.Optional(Type.Array(Type.Ref(WidgetStatus))),
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

export const schemas = withoutSymbols({
	UserID,
	WidgetID,
	WidgetStatus,
	Widget,
	CreateWidgetInput,
	ListUserWidgetsInput,
	ListWidgetsOutput,
});

export const components: ComponentsObject = {
	schemas,
	responses: {
		BadRequest: {
			description: "Bad request",
		},
	},
};
