# Yet Another RPC (YARPC) framework

YARPC aims to strike a balance between GraphQL's custom graph protocol and OpenAPI's HTTP-focused protocol to create a browser-compliant, OpenAPI-compatible RPC framework, providing you with all of the plugins and tools of your favourite HTTP framework and SDK generators without developers worrying about the things that don't matter for an RPC-driven system.

## What is RPC?

Remote Procedure Calls (RPC) can mean a few different things depending on the context, however this framework aims to focus on the fact that almost all developers work with a published client library or SDK when calling a remote endpoint. This ultimately means that most of the RESTful semantics around resource path naming, HTTP verbs, etc really don't matter.

You can simplify this down to:

* Operations can either be read only or some sort of mutation
* Operations are identified by an operation identifier, such as `saveChanges`, `clone_widget`, etc.
* Operations have an input shape, an output shape, and some potential errors

This is basically every interface definition language (IDL) that focuses on RPC--such as gRPC, SOAP, etc.-- follow.

## Goals & Philosophy

The goal of this library is **to be opinionated when it doesn't matter**, allowing developers to skip over the OpenAPI implementation details when they don't matter in an RPC context while still allowing for that complexity when desired.

* Maintain low developer cognitive overhead
* Remove bike shedding on trivialities, but allow for overriding when needed
* Reuse existing standards when they add value
* Reuse existing tooling wherever possible
* Bring your own frameworks

## Design

YARPC has two classes of API calls: queries and mutations. Queries are read-only operations that do not cause side effects and may have some caching. Mutations are operations that may cause changes to happen on the remote service.

There are three major components to making a YARPC service: the object schemas, the service definition, and the generators.

* The object schemas define the shapes of your inputs, outputs, and errors. Schemas are defined using standard JSONSchema syntax.
* The service definition lists the operations your RPC supports along with the input, output, and error shapes, plus any other annotations that influence the generators

## Getting started

```sh
npm install --save @freakyfelt/yarpc-cli
```

### Define your schemas

Next define your inputs, outputs, and errors using standard JSON Schema syntax. The following example uses the excellent [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) package, but you can use [zod](https://www.npmjs.com/package/zod), or (**gasp**) hand craft your own JSON Schema types so long as they are valid JSON Schemas.

```ts
// src/schemas.ts
import { Type } from '@sinclair/typebox';

const WidgetID = Type.String({ $id: 'WidgetID', pattern: '^w-[A-z0-9]{12}$' });

const Widget = Type.Object({
  widgetId: Type.Ref(WidgetID),
  createdOn: Type.String({ format: 'date-time' }),
});

const GetWidgetInput = Type.Object({
  widgetId: Type.Ref(WidgetID),
});

 // Define your various error shapes as well, getting as specific as you want.
const Error = Type.Object({
  code: Type.String(),
  message: Type.String(),
  details: Type.Object()
})

const schemas = {
  Error,
  GetWidgetInput,
  WidgetID,
  Widget,
};
```

> **Note**
> **It is strongly recommended to use an outer `object` for your input and response shapes**, even if you are returning an array (use an `items` key for example) so that you can extend it in the future. That being said, the framework won't stop you from doing it.

### Define your service

Next comes defining the operations for your service. Here is a simple example for the getWidget method:

```ts
// src/service.ts
import { OperationDefinition, ServiceBuilder } from '@freakyfelt/yarpc-sdk';
import { BadRequestError, NotFoundError } from './errors.js';

const builder = new ServiceBuilder({
  info: {
    // your standard OpenAPI `info` block here
    name: '@freakyfelt/hello-widgets',
    version: '1.0.0',
    description: 'Hello there, widgets.',
  },
  // standard OpenAPI componets block
  components: {
    schemas,
    errors: {
      BadRequestError,
      NotFoundError,
    }
  }
});

// client.getWidget({ widgetId })
// GET /operations/getWidget?widgetId={widgetId}
// 200 OK { ... }
builder.addQuery('getWidget', {
  description: 'Get a widget using the provided widgetId',

  request: {
    // Use a standard OpenAPI 3.1 JSON Schema reference
    schema: { $ref: '#/components/schemas/GetUserInput' },
  },
  response: {
    // or use the `schemas.ref()` helper method on the builder
    schema: builder.schemas.ref('Widget'),
  }
  // reference any valid response shape
  errors: [
    { $ref: '#/components/responses/BadRequestError' },
    // or use the components helper to do it
    builder.components.ref({ NotFoundError })
  ],

  // any other operation definition fields you would find in OpenAPI 3.1
});

export const oas = builder.toOpenAPI();
```

### Wire up your service and generate your clients

Finally you will need to consume the generated OpenAPI spec and implement the handlers. You can do this with whatever HTTP framework and OpenAPI spec consumer you want to accomplish this since you're just working with standard OpenAPI.

#### Query operations

By default all `query` operations will be turned into an OpenAPI spec operation that responds to the following HTTP call (but all parts can be customized).

```text
GET /queries/<operationId>?arg1=val1&...
Content-Type: application/json
```

The result will be sent with an HTTP 200 (OK) with an `application/json` response payload (though this can also be customized).

Here is an example of a Fastify handler for the `getWidget` operation:

```ts
// src/handlers/getWidget.ts
import type { types } from '../generated/types.js';

type Props = {
  Querystring: types.GetWidgetInput;
  Reply: types.Widget;
};

const getWidget: HandlerFn<Props> = async (req, reply) => {
  const widget = await req.app.stores.widgets.findOne({ id: req.query.widgetId });
  if (!widget) {
    return reply.notFoundError();
  }

  return reply.send(widget);
}
```

### Mutation operations

By default all mutation operations will be turned into an OpenAPI spec operation that responds to the following HTTP call (but all parts can be customized).

```text
POST /operations/<operationId>
Content-Type: application/json

{
  "arg1": "val1"
}
```

Here is an example of a Fastify handler for the `createWidget` operation:

```ts
// src/handlers/createWidget.ts
import type { types } from '../generated/schemas.js';

type Props = {
  Body: types.CreateWidgetInput;
  Reply: types.Widget;
};

const createWidget: HandlerFn<Props> = async (req, reply) => {
  const widget = await req.app.stores.widgets.createWidget(req.body);

  return reply.send(widget);
}
```

## Customizations

The goal of the builder is to be a lightweight abstraction on top of OpenAPI, injecting in defaults where it doesn't really matter. That being said, the builder does allow you to provide any OpenAPI 3.1 operation definitions you want. Additionally it allows you to set API-wide defaults for things like prefixes, but also any standard OpenAPI 3.1 fields.

### Changing the HTTP method and URL

You can use the keywords `method` and `path` to override the default HTTP method and route respectively. You can even specify path parameters, though you will then need to override the parameters mappings.

> **Note**
> This means you can still use the framework as a wrapper over OpenAPI to support both RESTful and RPC-like routes

For example, you may want to make a RESTful `modifyWidget` route that modifies a widget owned by a user in a RESTful manner:

```ts
builder.mutation('modifyWidget', {
  method: 'put',
  path: '/v1/users/{userId}/widgets/{widgetId}',

  request: {
    schema: builder.schemas.ref('ModifyWidgetInput'),
    parameters: {
      userId: { in: 'path', description: 'ID of the owning user of the widget' },
      widgetId: { in: 'path' },
    }
  }
  response: {
    schema: builder.schema.ref('Widget'),
  },
  errors: [
    builder.components.ref({ responses: 'BadRequest' }),
    builder.components.ref({ responses: 'NotFound' }),
  ]
})
```

This will result in the following `paths` object:

```yaml
paths:
  /v1/users/{userId}/widgets/{widgetId}:
    parameters:
      - name: userId
        description: ID of the owning user of the widget
        in: path
        schema: { $ref: '#/components/schemas/ModifyWidgetInput/properties/userId' }
      - name: widgetId
        in: path
        schema: { $ref: '#/components/schemas/ModifyWidgetInput/properties/widgetId' }
    post:
      operationId: modifyWidget
      requestBody:
        application/json:
          // note the `Body` label appended to the end
          spec: { $ref: '#/components/schemas/ModifyWidgetInputBody' }
```

> **Note**
> By default all parameters that are not overridden will end up in the default location (`query` for `query` operations and `requestBody` for `mutation` operations). This is to prevent confused parameters issues where some frameworks merge query and path into a single input.

## Why not GraphQL?

Note that some of this sounds like GraphQL with operations of either `query` or `mutation`. This simplifies the cognitive load on developers as they only need to know one piece of information: does this method change state? No "is this a POST? or a PUT? Oh maybe a PATCH?".

GraphQL also solves another cognitive load that REST has: URL routes naming. Sure the ideal internet would have strong resource-based routing, but the reality is that most machine to machine communication is a protected JSON RPC in disguise, not a scrapable semantic web resource.

But GraphQL also comes with challenges that have to be re-addressed, especially when it comes to observability:

* A custom query language that developers need to learn
* A high risk of O(n+1) queries
* Custom metrics and alerting on top of standard HTTP metrics
* Super complex response nesting structures

The goal of YARPC is to keep it simple: one business operation per request without re-inventing HTTP semantics.

> **Note**
> This makes actually it a great backend for a GraphQL backend-for-frontend (BFF) since the framework sits on top of OpenAPI 3.1, meaning you can use regular tooling to stitch the queries into the schema.

## Why not gRPC?

gRPC aims to be an extremely optimized RPC framework to minimize bandwidth usage with a compact on-the-wire protocol and http/2 features. This is great for traffic-heavy services that need highly-optimized RPC calls, however it requires learning another language (protobuf) and using the subset of tooling that's available for building gRPC clients that can transform protobuf.

## Changelog

The changelog can be found on the [Releases page](/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Bruce Felt](https://github.com/freakyfelt/yarpc) and [contributors](/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
