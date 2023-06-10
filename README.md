# Yet Another RPC (YARPC)

YARPC aims to strike a balance between GraphQL's custom graph protocol and OpenAPI's HTTP-focused protocol to create a browser-compliant, OpenAPI-compatible RPC framework, providing you with all of the plugins and tools of your favorite HTTP framework and SDK generators without developers worrying about the things that don't matter for a JSON RPC-driven system.

## Goals & Philosophy

The goal of this library is **to be opinionated when it doesn't matter**, allowing developers to skip over the OpenAPI implementation details when they don't matter (in an SDK-driven RPC context) while still allowing for that complexity when needed.

- Keep the focus on business operations, not HTTP semantics
- Remove bike shedding on trivialities such as `PUT` vs `POST`, path formats and parameter locations, etc
- Compile down to OpenAPI to reuse existing tooling
- Draw from other RPC frameworks where it makes sense

## What is RPC?

Remote Procedure Calls (RPC) can mean a few different things depending on the context, however this library aims to focus on the fact that almost all developers work with a published client library or SDK when calling a remote endpoint. This ultimately means that most of the RESTful semantics around resource path naming, HTTP verbs, etc really don't matter.

You can simplify this down to:

- Operations are usually either read only or cause some sort of change/mutation
- Operations are identified by an operation identifier, such as `saveChanges`, `clone_widget`, `ListObjects`
- Operations may have an input shape, an output shape, and some potential errors

This is basically every interface definition language (IDL) that focuses on RPC--such as gRPC, SOAP, etc.-- follow.

## Design

YARPC has two types of API calls: queries and mutations.

- Queries are read-only operations that do not cause side effects.
- Mutations are operations that may cause side effects such as changing a record in a data store or sending a notification.

There are three major components to making a YARPC service: input/output schemas, error responses, and the service definition.

- Object schemas define the shapes of your inputs, outputs, and errors. Schemas are defined using standard JSON Schema syntax
- Error responses are standard [OpenAPI response objects][oas:response-object] with a description and an optional schema
- Operations define the methods your RPC supports along with references to the input, output, and error shapes, plus any other OpenAPI-compatible operation overrides

### Query operations

Queries are read-only operations that consuming systems can call to fetch data, similar to any normal HTTP `GET` request. As with HTTP `GET` requests it's recommended to not have side effects and to optionally allow for caching.

```yaml
operations:
  queries:
    getWidget:
      description: Gets the widget identified by the provided widgetId
      input:
        schema: { $ref: '#/components/schemas/GetWidgetInput' }
      output:
        schema: { $ref: '#/components/schemas/Widgets' }
      errors:
        401: { $ref: '#/components/responses/InvalidCredentials' }
        403: { $ref: '#/components/responses/NotAuthorized' }
        404: { $ref: '#/components/responses/NotFound' }
```

By default this will generate an OpenAPI path item under `/queries/${operationId}.get` with all inputs mapped to `query` parameters and the output mapped to an HTTP 200 response with a content type of `application/json`.

<details>
  <summary>Resulting OpenAPI path item definition</summary>

```yaml
paths:
  /queries/getWidget:
    get:
      operationId: getWidget
      description: Gets the widget identified by the provided widgetId
      parameters:
        - name: widgetId
          in: query
          schema:
            $ref: '#/components/schemas/GetWidgetInput/properties/widgetId'
          required: true
      responses:
        200:
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Widget' }
        401: { $ref: '#/components/responses/InvalidCredentials' }
        403: { $ref: '#/components/responses/NotAuthorized' }
        404: { $ref: '#/components/responses/NotFound' }
```
</details>

<details>
  <summary open>Resulting example HTTP request</summary>

```text
> GET /queries/getWidget?widgetId=w-1a2b3c4d5e6f HTTP/1.1
> Accept: application/json
< HTTP/1.1 200 OK
< Content-Type: application/json
{
  "id": "w-1a2b3c4d5e6f",
  "userId": "u-2b3c4d5e6f1a",
  "status": "active",
  "createdAt": "2023-01-02T03:04:05Z"
}
```
</details>

### Mutation operations

Mutation operations are operations that may result in side effects, such as a change in one or more data stores or sending notifications to other systems for further processing.

```yaml
operations:
  mutations:
    createWidget:
      description: Creates the specified widget
      input:
        schema: { $ref: '#/components/schemas/CreateWidgetInput' }
      output:
        schema: { $ref: '#/components/schemas/Widget' }
      errors:
        401: { $ref: '#/components/responses/InvalidCredentials' }
        403: { $ref: '#/components/responses/NotAuthorized' }
        422: { $ref: '#/components/responses/InvalidRequest' }
```

By default this will generate an OpenAPI path item under `paths['/mutations/${operationId}'].post` with the input being mapped to the `application/json` content type for the `requestBody` and the output mapped to an HTTP 200 response with a content type of `application/json`.

<details>
  <summary>Resulting OpenAPI path item definition</summary>

```yaml
paths:
  /mutations/createWidget:
    post:
      operationId: createWidget
      description: Creates the specified widget
      requestBody:
        required: true
        application/json:
          schema: { $ref: '#/components/schemas/CreateWidgetInput' }
      responses:
        200:
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Widget' }
        401: { $ref: '#/components/responses/InvalidCredentials' }
        403: { $ref: '#/components/responses/NotAuthorized' }
        404: { $ref: '#/components/responses/NotFound' }
```
</details>

<details>
  <summary open>Resulting example HTTP request</summary>

```text
> POST /mutations/<operationId>
> Accept: application/json
< HTTP/1.1 200 OK
< Content-Type: application/json

{
  "arg1": "val1"
}
```
</details>

## Getting started

```sh
npm install --save @freakyfelt/yarpc-cli
```

### Define schema components

Next define your inputs, outputs, and errors using standard JSON Schema syntax and include them in an OpenAPI-compatible [`components` section][oas:components-object]

> **Note**
> You might want to consider defining your JSON Schema shapes using libraries such as [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) or [zod](https://www.npmjs.com/package/zod) to reduce the boilerplate of JSON Schema. In the end any OpenAPI spec is parsed as JSON, meaning using JavaScript/TypeScript can save time and headaches.

Some notes:

- The input schema MUST be an object if present
- The output schema can be any JSON Schema
- Errors should be defined as standard [OpenAPI responses][oas:response-object], usually with a content type of `application/json`

> **Note**
> **It is strongly recommended to use an outer `object` for your response schema**, even if you are returning an array (use an `items` key for example) so that you can extend it in the future (think pagination). That being said, the tooling won't stop you from using primitive schemas for the response.

<details>
  <summary>Example OpenAPI schema components</summary>

```yaml
components:
  schemas:
    # Primitives
    ISO8601Timestamp:
      type: string
      format: date-time
    UserID:
      type: string
      pattern: '^u-[A-z0-9]{12}$'
    WidgetID:
      type: string
      pattern: '^w-[A-z0-9]{12}$'
    WidgetStatus:
      anyOf:
        - active
        - disabled

    # Domain objects
    Widget:
      type: object
      required: ['id', 'createdAt']
      properties:
        id: { $ref: '#/components/schemas/WidgetID' }
        userId: { $ref: '#/components/schemas/UserID' }
        status: { $ref: '#/components/schemas/WidgetStatus' }
        createdAt: { $ref: '#/components/schemas/ISO8601Timestamp' }
    
    # Inputs / Outputs
    GetWidgetInput:
      type: object
      required: ['widgetId']
      properties:
        widgetId: { $ref: '#/components/schemas/WidgetID' }
    CreateWidgetInput:
      type: object
      required: ['status', 'userId']
      properties:
        userId: { $ref: '#/components/schemas/UserID' }
    
    # Error shape used by all error responses
    Error:
      type: object
      required: ['code', 'message']
      properties:
        code: { type: 'string' }
        message: { type: 'string' }
        details:
          type: object
          allowAdditionalProperties: true
```
</details>

### Define error responses

Next create [OpenAPI response objects][oas:response-object] for any business logic errors your operations may "throw", such as the standard NotFound, NotAuthorized, etc for HTTP, but also potentially for other domain-specific errors.

Just like in OpenAPI response shapes are usually included in the `components` section under a `responses` key

<details>
  <summary>Example OpenAPI response components</summary>

```yaml
components:
  responses:
    NotFound:
      description: The resource was not found (HTTP 404)
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
    InvalidCredentials:
      description: The request lacks valid credentials (HTTP 401)
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
    NotAuthorized:
      description: The request lacks sufficient credentials (HTTP 403)
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }

    TooManyRequests:
      description: Too many requests were sent in a given amount of time (HTTP 429)
      headers:
        Retry-After:
          description: Seconds to wait before retrying the request
          schema: { type: 'integer' }
          required: true
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
```
</details>

### Define operations

Finally define your operations under YARPC's non-OpenAPI standard `operations` key. Queries will live under the `queries` key and mutations under the `mutations` keys. You will need to come up with an operation ID (e.g. `getWidgets`, `cancelAccount`), the inputs, and the response shape for each operation.

- The request shape will use the `object` schema specified by the `input` object for generating the OpenAPI inputs
  - For queries the shape specified for `input` will have its values mapped to an array of [parameter objects][oas:parameter-object] with an `in` value of `query`
  - For mutations the shape specified for `input` will have its values mapped to the `content` field of the [`requestBody`][oas:requestBody-object] in the `application/json` [media type][oas:mediaType-object]
- The `output` object will be the HTTP body of the response and will be mapped to the `application/json` [media type object][oas:mediaType-object] for the HTTP `200` status code
- Errors are mapped to a standard [responses object][oas:response-object]

For example, here is a sample definition for a `getWidget` query operation:

```yaml
operations:
  queries:
    getWidget:
      description: Gets the widget identified by the provided widgetId
      input:
        schema: { $ref: '#/components/schemas/GetWidgetInput' }
      output:
        # the standard shape of a media type object
        schema: { $ref: '#/components/schemas/Widget' }
      errors:
        401: { $ref: '#/components/schemas/InvalidCredentials' }
        403: { $ref: '#/components/schemas/NotAuthorized' }
        404: { $ref: '#/components/schemas/NotFound' }
```

## Generating the resulting OpenAPI specification

The CLI includes a `yarpc-cli` that can be used to generate the resulting OpenAPI 3.1 specification. This works by transforming your queries and mutations and then merging them with any paths that may have been specified in the input YARPC specification.

```sh
npx @freakyfelt/yarpc-cli --input yarpc.json --output openapi.json
```

### Emitting YAML

By default the CLI will emit JSON, but `--format yaml` can be used to emit YAML instead

```
npx @freakyfelt/yarpc-cli --input yarpc.json --output openapi.yaml --format yaml
```

### Using stdin and stdout

The CLI can also read from `stdin` and write to `stdout` by using `-` instead of a file name

```sh
# read the YARPC spec from stdin and write the OpenAPI spec to stdout
cat yarpc.json | npx @freakyfelt/yarpc-cli --input - --output - | ./build-tool.sh
```

## Customizations

The goal of the builder is to be a lightweight abstraction on top of OpenAPI, injecting in defaults where it doesn't really matter for services vending an SDK. That being said, the builder does allow you to provide any OpenAPI 3.1 operation definitions you want.

### Adding more properties to parameters

Sometimes you may want to add additional properties to a parameter, such as an example or a deprecation message, or to override its location to be in the `path` or `header`. To do this, you can provide an additional `parameters` key on the input that is keyed by the field names.

For example, you can add a deprecation message to a field:

```yaml
operations:
  queries:
    listWidgets:
      input:
        schema: { $ref: '#/components/schemas/ListWidgetsInput' }
        parameters:
          status:
            description: 'Use "statuses" instead'
            deprecated: true
      output:
        schema: { $ref: '#/components/schemas/ListWidgetsOutput' }

      errors: []
```

<details>
  <summary>Resulting OpenAPI path specification</summary>

```yaml
paths:
  /queries/listWidgets:
    operationId: listWidgets
    parameters:
      - name: status
        in: query
        schema: { $ref: '#/components/ListWidgetsInput/properties/status' }
        description: 'Use "statuses" instead'
        deprecated: true
      - name: userId
        in: query
        ...
```

</details>

> **Note**
> Any fields added will take precedence over the defaults for `in` and `schema`

### Changing the response status code and description

By default the response status code will be an HTTP 200 with a description of "OK". You can customize these in the `output`, e.g. for describing what "success" means or using a more appropriate response status code.

```yaml
operations:
  mutations:
    createWidget:
      description: Creates the specified widget

      input:
        schema: { $ref: '#/components/schemas/CreateWidgetInput' }
      output:
        description: Widget created without issue
        statusCode: 201
        schema: { $ref: '#/components/schemas/Widget' }
      errors:
        400: { $ref: '#/components/responses/BadRequest' }
        404: { $ref: '#/components/responses/NotFound' }
```

This will result in the following paths object:

<details>
  <summary>Resulting OpenAPI paths</summary>

```yaml
paths:
  /mutations/createWidget:
    post:
      operationId: createWidget
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateWidgetInput' }
      responses:
        201:
          description: Widget created without issue
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Widget' }
        400: { $ref: '#/components/responses/BadRequest' }
        404: { $ref: '#/components/responses/NotFound' }
```
</details>

### Changing the HTTP method and URL

By default parameters will end up in the default location (`query` for `query` operations and `requestBody` for `mutation` operations). You can use the keywords `method` and `path` to override the default HTTP method and resulting path respectively. You can even specify path parameters, though you will then need to override the parameters mappings.

> **Note**
> The YARPC operations can happily live alongside your standard [`paths` object][oas:paths-object] in the specification. The library will merge the resulting paths objects.

For example, you may want to make a RESTful `modifyWidget` route that modifies a widget in a RESTful manner:

```yaml
operations:
  mutations:
    modifyWidget:
      description: Makes changes to the specified widget identified by the provided userId and widgetId
      method: put
      path: /v1/widgets/{widgetId}

      input:
        schema: { $ref: '#/components/schemas/ModifyWidgetInput' }
        parameters:
          widgetId:
            in: path
      output:
        schema: { $ref: '#/components/schemas/Widget' }
      errors:
        400: { $ref: '#/components/responses/BadRequest' }
        404: { $ref: '#/components/responses/NotFound' }
```

This will result in the following `paths` object:

<details>
  <summary>Resulting OpenAPI paths</summary>

```yaml
paths:
  /v1/widgets/{widgetId}:
    post:
      operationId: modifyWidget
      parameters:
        - name: widgetId
          in: path
          schema: { $ref: '#/components/schemas/WidgetID' }
      requestBody:
        application/json:
          schema:
            type: object
            required:
              - userId
            properties:
              userId: { $ref: '#/components/schemas/UserID' }
              ...
```
</details>

## Why not GraphQL?

Note that some of this sounds like GraphQL with operations of either `query` or `mutation`. This simplifies the cognitive load on developers as they only need to know one piece of information: does this method change state? No "is this a POST? or a PUT? Oh maybe a PATCH?".

GraphQL also solves another cognitive load that REST has: URL routes naming. Sure the ideal internet would have strong resource-based routing, but the reality is that most machine to machine communication is a protected JSON RPC in disguise, not a scrapable semantic web resource.

But GraphQL also comes with challenges that have to be re-addressed, especially when it comes to observability:

- A custom query language that developers need to learn
- A high risk of O(n+1) queries
- Custom metrics and alerting on top of standard HTTP metrics
- Super complex response nesting structures

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

[oas:components-object]: https://spec.openapis.org/oas/v3.1.0#components-object
[oas:operation-object]: https://spec.openapis.org/oas/v3.1.0#operation-object
[oas:requestBody-object]: https://spec.openapis.org/oas/v3.1.0#request-body-object
[oas:mediaType-object]: https://spec.openapis.org/oas/v3.1.0#mediaTypeObject
[oas:response-object]: https://spec.openapis.org/oas/v3.1.0#response-object
[oas:parameter-object]: https://spec.openapis.org/oas/v3.1.0#parameter-object
[oas:paths-object]: https://spec.openapis.org/oas/v3.1.0#paths-object
