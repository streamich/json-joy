import {setup, setupWithStringCodec} from './setup';

test('can create server', async () => {
  setup();
});

test('can execute ping', async () => {
  const {server} = setup();
  const id = String(Math.random());
  const result = await server.onMessages({}, {id, method: 'ping'});
  expect(result).toStrictEqual({
    jsonrpc: '2.0',
    id,
    result: 'pong',
  });
});

test('can execute ping using JSON string codec', async () => {
  const {server} = setupWithStringCodec();
  const id = String(Math.random());
  const result = await server.onMessages({}, JSON.stringify({id, method: 'ping'}));
  expect(JSON.parse(result as any)).toStrictEqual({
    jsonrpc: '2.0',
    id,
    result: 'pong',
  });
});

test('executes notify callback on notification message and passes context', async () => {
  const {server, onNotification} = setup();
  await new Promise((r) => setTimeout(r, 1));
  expect(onNotification).toHaveBeenCalledTimes(0);
  await server.onMessage({foo: 'bar'}, {method: 'test', params: 123});
  expect(onNotification).toHaveBeenCalledTimes(1);
  expect(onNotification).toHaveBeenCalledWith('test', 123, {foo: 'bar'});
});

test('executes notification callback synchronously and passes through context', async () => {
  const {server, onNotification} = setup();
  server.onMessage({userId: '123'}, {method: 'gg', params: {x: 'y'}});
  server.onMessage({userId: '456'}, {method: 'gg2', params: {x: 'y2'}});
  expect(onNotification).toHaveBeenCalledTimes(2);
  expect(onNotification).toHaveBeenCalledWith('gg', {x: 'y'}, {userId: '123'});
  expect(onNotification).toHaveBeenCalledWith('gg2', {x: 'y2'}, {userId: '456'});
});

test('return "Method not found" error when calling non-existing method', async () => {
  const {server} = setup();
  const res = await server.onMessage({userId: '123'}, {id: 3, method: 'UNKNOWN', params: 3});
  expect(res).toStrictEqual({
    jsonrpc: '2.0',
    id: 3,
    error: {code: -32601, message: 'Method not found'},
  });
});

test('returns error message when method throws', async () => {
  const {server} = setup();
  const res = await server.onMessage({userId: '123'}, {id: 34, method: 'error'});
  expect(res).toStrictEqual({
    jsonrpc: '2.0',
    id: 34,
    error: {code: 0, message: 'this promise can throw'},
  });
});

test('returns error message on invalid message', async () => {
  const {server} = setup();
  const res = await server.onMessage({}, [] as any);
  expect(res).toMatchObject({id: null, error: {code: -32600, message: 'Invalid Request'}});
});

test('returns error message on invalid message type', async () => {
  const {server} = setup();
  const res = await server.onMessage({}, [{x: 1, y: 2} as any] as any);
  expect(res).toMatchObject({id: null, error: {code: -32600, message: 'Invalid Request'}});
});

describe('strict mode', () => {
  test('throws if {"jsonrpc": "2.0"} is not provided', async () => {
    const {server} = setup(undefined, true);
    const res1 = await server.onMessage({userId: '123'}, {jsonrpc: '2.0', id: '2', method: 'double', params: {num: 3}});
    const res2 = await server.onMessage({userId: '123'}, {id: '3', method: 'double', params: {num: 3}});
    expect(res1).toStrictEqual({jsonrpc: '2.0', id: '2', result: {num: 6}});
    expect(res2).toStrictEqual({jsonrpc: '2.0', id: '3', error: {code: -32600, message: 'Invalid Request'}});
  });

  test('throws if {"jsonrpc": "2.0"} is not provided for notification', async () => {
    const {server} = setup(undefined, true);
    const res = await server.onMessage({userId: '123'}, {method: 'double', params: 3});
    expect(res).toStrictEqual({jsonrpc: '2.0', id: null, error: {code: -32600, message: 'Invalid Request'}});
  });

  test('successfully notifies if {"jsonrpc": "2.0"} is provided', async () => {
    const {server, onNotification} = setup(undefined, true);
    const res = await server.onMessage({userId: '123'}, {jsonrpc: '2.0', method: 'foo', params: 25});
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(onNotification).toHaveBeenCalledWith('foo', 25, {userId: '123'});
  });
});
