import {Router} from '../router';

describe('can route and extract params', () => {
  const router = new Router();
  router.add(['GET /ping', 'GET /pong'], 'PING');
  router.add('GET /echo', 'ECHO');
  router.add('GET /users/{user}', 'GET_USER');
  router.add('GET /users/{user}/preview', 'USER_PREVIEW');
  router.add('GET /users/{user}/avatar/{size}.{extension}', 'USER_AVATAR_IMG_EXT');
  router.add('GET /users/{user}/avatar/{size}.png', 'USER_AVATAR_IMG');
  router.add('GET /users/{user}/avatar/{size}', 'USER_AVATAR_SIZE');
  router.add('GET /users/{user}/avatar', 'USER_AVATAR');
  router.add('POST /users/{user}/edit', 'USER_EDIT');
  router.add('POST /users/{user}/create', 'USER_CREATE');
  router.add('POST /users', 'ALL_USERS');
  router.add('POST /coordinates/{lat}-{lng}', 'COORDINATES');
  router.add('GET /😀/plus/{emoji}', 'EMOJI');
  router.add('GET /static/{path::\n}', 'STATIC');
  router.add('GET /{category}/{id}', 'DYNAMIC_CATEGORY');
  router.add('{:(POST|PUT)} /rpc/{method}', 'RPC');
  router.add('{:(POST|PUT)} /rpc2/{method}', 'RPC2');
  router.add('{httpMethod:[^ ]+} /json-rpc/{rpcMethod}', 'JSON-RPC');
  router.add('{httpMethod:*: } /json-rpc-2/{rpcMethod}', 'JSON-RPC-2');
  router.add('GET /collections/{collection}/{:blocks?}', 'COLLECTION_BLOCKS');
  router.add('GET /a/b/collections{:(/pretty)?}', 'COLLECTIONS_MAYBE_PRETTY');
  const matcher = router.compile();
  // console.log(router + '');
  // console.log(matcher + '');

  const assertMatch = (route: string, data: unknown, params: unknown[]) => {
    const match = matcher(route);
    expect(typeof match).toBe('object');
    expect(match!.data).toEqual(data);
    expect(match!.params || []).toEqual(params);
  };

  test('can match constant multi route destination', () => {
    assertMatch('GET /ping', 'PING', []);
    assertMatch('GET /pong', 'PING', []);
  });

  test('can match constant single route destination', () => {
    assertMatch('GET /echo', 'ECHO', []);
  });

  test('can match a simple one parameter step route', () => {
    assertMatch('GET /users/1', 'GET_USER', ['1']);
  });

  test('can match a simple single in-the-middle parameter route', () => {
    assertMatch('GET /users/123/preview', 'USER_PREVIEW', ['123']);
  });

  test('can match a simple single in-the-middle parameter route - 2', () => {
    assertMatch('GET /users/123/avatar', 'USER_AVATAR', ['123']);
  });

  test('can match a two parameter route', () => {
    assertMatch('GET /users/123/avatar/64', 'USER_AVATAR_SIZE', ['123', '64']);
    assertMatch('GET /users/xyz/avatar/square', 'USER_AVATAR_SIZE', ['xyz', 'square']);
  });

  test('can match a two parameter route with static file extension', () => {
    assertMatch('GET /users/123/avatar/64x64.png', 'USER_AVATAR_IMG', ['123', '64x64']);
  });

  test('can match a multi-parameter route with file extension as parameter', () => {
    assertMatch('GET /users/123/avatar/64x64.jpeg', 'USER_AVATAR_IMG_EXT', ['123', '64x64', 'jpeg']);
  });

  test('can match a POST route with a parameter', () => {
    assertMatch('POST /users/123/edit', 'USER_EDIT', ['123']);
  });

  test('can match a POST route with a parameter - 2', () => {
    assertMatch('POST /users/123/create', 'USER_CREATE', ['123']);
  });

  test('can match a static POST route', () => {
    assertMatch('POST /users', 'ALL_USERS', []);
  });

  test('can match a coordinates pattern', () => {
    assertMatch('POST /coordinates/0.832823-1.233483943', 'COORDINATES', ['0.832823', '1.233483943']);
  });

  test('can match first route step as dynamic category', () => {
    assertMatch('GET /dogs/1234', 'DYNAMIC_CATEGORY', ['dogs', '1234']);
  });

  test('can match regex "or" pattern', () => {
    assertMatch('POST /rpc/method1', 'RPC', ['method1']);
  });

  test('can match regex "or" pattern - 2', () => {
    assertMatch('POST /rpc2/method2', 'RPC2', ['method2']);
  });

  test('can match HTTP method name and RPC method name', () => {
    assertMatch('POST /json-rpc/hello-world', 'JSON-RPC', ['POST', 'hello-world']);
  });

  test('can match HTTP method name and RPC method name using "util" step', () => {
    assertMatch('PUT /json-rpc-2/product.service.methodExecute', 'JSON-RPC-2', [
      'PUT',
      'product.service.methodExecute',
    ]);
  });

  test('can match when regex is last step', () => {
    assertMatch('GET /collections/1234/block', 'COLLECTION_BLOCKS', ['1234']);
    assertMatch('GET /collections/1234/blocks', 'COLLECTION_BLOCKS', ['1234']);
    expect(() => assertMatch('GET /collections/1234/blockz', 'COLLECTION_BLOCKS', ['1234'])).toThrow();
  });

  test('last step is optional', () => {
    assertMatch('GET /a/b/collections/pretty', 'COLLECTIONS_MAYBE_PRETTY', []);
    assertMatch('GET /a/b/collections', 'COLLECTIONS_MAYBE_PRETTY', []);
  });

  test('can match till end of line wildcard', () => {
    assertMatch('GET /static/a', 'STATIC', ['a']);
    assertMatch('GET /static/dir1/dir2/file.ext', 'STATIC', ['dir1/dir2/file.ext']);
  });

  test('should return "undefined" on non-existing route', () => {
    const match = matcher('GET /this/route/does/not/exist');
    expect(match).toBe(undefined);
  });

  test('can match a route with emojis', () => {
    assertMatch('GET /😀/plus/✅', 'EMOJI', ['✅']);
  });
});

describe('Options', () => {
  test('can specify custom "defaultUntil" character', () => {
    const router1 = new Router();
    router1.add('GET |users|{user}', 'USER');
    const matcher1 = router1.compile();
    const res1 = matcher1('GET |users|123|avatar');
    expect(res1).not.toBe(undefined);
    const router2 = new Router({defaultUntil: '|'});
    router2.add('GET |users|{user}', 'USER');
    const matcher2 = router2.compile();
    const res2 = matcher2('GET |users|123|avatar');
    expect(res2).toBe(undefined);
  });
});
