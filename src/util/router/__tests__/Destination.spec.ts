import {Destination} from '../router';

test('can create a static route', () => {
  const dest = Destination.from('GET /ping', 123);
  expect(dest.routes).toHaveLength(1);
  expect(dest.data).toBe(123);
  expect(dest.routes[0].toText()).toBe('GET /ping');
});

describe('.from()', () => {
  const assertFrom = (def: string, expected: string = def) => {
    const dest = Destination.from(def, null);
    expect(dest.routes).toHaveLength(1);
    expect(dest.routes[0].toText()).toBe(expected);
  };

  test('can create a static route', () => {
    assertFrom('POST /ping');
  });

  test('can use regex for or statement', () => {
    assertFrom('{:(POST|GET)} /ping');
  });

  test('can match any method', () => {
    assertFrom('{method:.+: } /echo');
  });

  test('can specify category variations', () => {
    assertFrom(
      'GET /{:(collection|collections)}/{collectionId}/{:blocks?}/{blockId}',
      'GET /{:(collection|collections)}/{collectionId::/}/{:blocks?}/{blockId::/}',
    );
  });

  test('can parse until next slash', () => {
    assertFrom('GET /posts/{postId}', 'GET /posts/{postId::/}');
  });

  test('can parse until next dot', () => {
    assertFrom('GET /files/{filename}.txt', 'GET /files/{filename::.}.txt');
  });

  test('can parse until next dot and next slash', () => {
    assertFrom('GET /files/{filename}.{extension}', 'GET /files/{filename::.}.{extension::/}');
  });

  test('can wildcard the remainder of the path', () => {
    assertFrom('GET /static/{path:.+}');
  });

  test('when parsing one step, matches until next slash', () => {
    assertFrom('GET /step/{path::}', 'GET /step/{path::/}');
  });

  test('when parsing one step, matches until next slash', () => {
    assertFrom('GET /step/{path::}', 'GET /step/{path::/}');
  });

  test('can make last parameter optional', () => {
    assertFrom('GET /users{user:(/[^/]+)?}');
  });
});
