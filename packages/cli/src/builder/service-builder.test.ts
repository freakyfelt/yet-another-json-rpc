import { Type } from "@sinclair/typebox";
import assert from "node:assert";
import test from "node:test";
import { ResponseDefinition } from "../types/operations.js";
import { YARPCServiceBuilder } from "./service-builder.js";

const schemas = {
	GetWidgetInput: Type.Object({
		userId: Type.String(),
		widgetId: Type.String(),
	}),
	Widget: Type.Object({
		widgetId: Type.String(),
		name: Type.String(),
	}),
	Error: Type.Object({
		code: Type.String(),
		message: Type.String(),
		details: Type.Optional(Type.Any()),
	}),
};

const errors: Record<string, ResponseDefinition<keyof typeof schemas>> = {
	NotFound: {
		description: "The entity was not found",
		schema: "Error",
	},
};

const exampleQuery = {
	description: "getWidget",
	path: "/users/{userId}/widgets",
	request: {
		schema: "GetWidgetInput",
		parameters: {
			userId: { in: "path" },
		},
	},
	response: {
		schema: "Widget",
	},
} as const;

const exampleMutation = {
	description: "createWidget",
	request: {
		schema: "CreateWidgetInput",
	},
	response: {
		schema: "Widget",
	},
} as const;

test("addQuery", (t) => {
	const builder = new YARPCServiceBuilder({
		info: {
			title: "Test",
			version: "1.0.0",
		},
		components: {
			errors,
			schemas,
		},
		oas: {
			"x-service-name": "test",
		},
	});

	t.test("adds a query", () => {
		builder.addQuery("foo", exampleQuery);
		assert.equal(builder.operations.foo, {
			type: "query",
			operationId: "foo",
			...exampleQuery,
		});
	});

	t.test("throws if operationId already exists", () => {
		builder.addQuery("foo", exampleQuery);
		assert.throws(() => builder.addQuery("foo", exampleQuery), {
			message: `Operation with id "foo" already exists`,
		});
	});
});

test("addMutation", (t) => {
	const builder = new YARPCServiceBuilder({
		info: {
			title: "Test",
			version: "1.0.0",
		},
		components: {
			schemas: {
				CreateWidgetInput: Type.Object({
					id: Type.Integer(),
				}),
				Widget: Type.Object({
					id: Type.Integer(),
				}),
			},
		},
	});

	t.test("adds a query", () => {
		builder.addMutation("foo", exampleMutation);
		assert.equal(builder.operations.foo, {
			type: "query",
			operationId: "foo",
			...exampleMutation,
		});
	});

	t.test("throws if operationId already exists", () => {
		builder.addMutation("foo", exampleMutation);
		assert.throws(() => builder.addMutation("foo", exampleMutation), {
			message: `Operation with id "foo" already exists`,
		});
	});
});
