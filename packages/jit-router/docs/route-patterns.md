## Route patterns

A *route* is a string parsed into an ordered list of *steps*. Three step
types make up the grammar.

| Step | Syntax | Matches |
|---|---|---|
| Exact | `literal text` | The text verbatim |
| Until | `{name}` or `{name::<delim>}` | A parameter, up to the next delimiter |
| Regex | `{name:<pattern>}` | A parameter matching a regular expression |


## Exact steps

Whatever isn't inside `{...}` is matched literally:

```ts
router.add('GET /api/users', 'USERS');
router.add('POST /login', 'LOGIN');
```

Method, slashes, and arbitrary text all become exact steps. The router
doesn't care that `GET ` is at the start --- it's just a string match.


## Until steps (parameters)

`{name}` captures a parameter up to the next character in the route. The
delimiter is inferred from the character that follows the closing brace:

```ts
router.add('GET /users/{id}', 'GET_USER');          // delimiter: '/' or end
router.add('GET /files/{name}.{ext}', 'GET_FILE');  // delimiters: '.' then '/'
```

Override the delimiter explicitly with `{name::<delim>}`:

```ts
router.add('GET /list|{tag::|}|view', 'LIST');      // until '|'
```

Use `\n` to capture to end-of-string --- this is the wildcard:

```ts
router.add('GET /static/{path::\n}', 'STATIC_FILES');

const m = matcher('GET /static/css/app/index.css');
m?.params;  // ['css/app/index.css']
```

The constructor option `defaultUntil` changes the default delimiter for the
whole router:

```ts
const router = new Router({defaultUntil: '|'});
router.add('GET |users|{id}', 'USER_HANDLER');
```


## Regex steps

`{name:<pattern>}` matches a parameter with a regular expression. The
parameter still captures up to a delimiter --- by default whatever
follows in the route, overridable with a third colon:

```ts
router.add('GET /users/{id:[0-9]+}', 'USER_BY_ID');
router.add('{method:(GET|POST)} /api/{endpoint}', 'API');
router.add('GET /assets/{file}.{ext:(js|css|png)}', 'ASSET');
```

`{name:pattern:delim}` for an explicit delimiter:

```ts
router.add('{m:*: } /json-rpc/{procedure}', 'JSON_RPC');
//          ^^^^^^^ matches anything up to a space
```

Anonymous params (`{:pattern}`) are useful when you don't need the captured
value:

```ts
router.add('{:(POST|PUT)} /rpc/{method}', 'RPC');
router.add('GET /collections/{name}/{:blocks?}', 'COLLECTION_BLOCKS');
```


## Parameter capture order

Parameters are returned in `match.params` in the order they appear in the
route:

```ts
router.add('GET /users/{userId}/posts/{postId}', 'POST');
const m = matcher('GET /users/42/posts/7');
m?.params;  // ['42', '7']
```

Anonymous params (`{:pattern}`) are *not* captured into `params` --- they
match but don't add to the array.


## Multiple routes to one destination

`add` accepts an array to map multiple routes to the same data:

```ts
router.add(['GET /ping', 'GET /pong'], 'PING_HANDLER');
```

Both URLs return the same `match.data`. This is the cheapest way to
express aliases.


## Mixing patterns

The example below stresses the grammar with a realistic API surface:

```ts
const router = new Router();

router.add('GET /api/v{version:[12]}/users', 'API_USERS');
router.add('GET /assets/{file}.{ext:(js|css|png|jpg)}', 'STATIC');
router.add('GET /blog{trailing:/?}', 'BLOG_INDEX');
router.add('POST /orgs/{org}/repos/{repo}/issues/{num:[0-9]+}', 'ISSUE');
router.add('{method:(GET|HEAD)} /files/{path::\n}', 'FILE');

const match = router.compile();
```
