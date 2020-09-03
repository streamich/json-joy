import {JsonRpcServer} from '../JsonRpcServer';

test('can create server', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
});

test('does not call callback on boot', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  await new Promise(r => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('executes notify callback on notification message and passes context', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  await new Promise(r => setTimeout(r, 1));
  server.onMessage({}, {method: 'test', params: 123});
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('test', {}, 123);
});

test('executes notification callback synchronously and passes through context', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  server.onMessage({userId: '123'}, {method: 'gg', params: {x: 'y'}});
  server.onMessage({userId: '456'}, {method: 'gg2', params: {x: 'y2'}});
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(2);
  expect(notify).toHaveBeenCalledWith('gg', {userId: '123'}, {x: 'y'});
  expect(notify).toHaveBeenCalledWith('gg2', {userId: '456'}, {x: 'y2'});
});

test('executes call callback on subscribe message', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  server.onMessage({userId: '123'}, {id: 1, method: 'foo', params: 'bar'});
  expect(notify).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', {userId: '123'}, 'bar');
});

test('returns back call callback response', async () => {
  const call = jest.fn(async (method, ctx, payload) => {
    if (method === 'double') return {a: 2 * payload};
    throw new Error(`Unknown method [${method}].`);
  });
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({userId: '123'}, {id: '3', method: 'double', params: 3});
  expect(call).toHaveBeenCalledTimes(1);
  expect(res).toEqual({id: '3', result: {a: 6}});
});

test('returns error message on call callback throw', async () => {
  const call = jest.fn(async (method, ctx, payload) => {
    if (method === 'double') return {a: 2 * payload};
    throw new Error(`Unknown method [${method}].`);
  });
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({userId: '123'}, {id: 3, method: 'UNKNOWN', params: 3});
  expect(call).toHaveBeenCalledTimes(1);
  expect(res).toMatchObject({id: 3, error: {message: 'Unknown method [UNKNOWN].'}});
});

test('returns error message on invalid method', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({}, {id: 'asdf', method: 123} as any);
  expect(call).toHaveBeenCalledTimes(0);
  expect(res).toMatchObject({id: 'asdf', error: {message: 'Invalid method.'}});
});

test('returns error message on invalid message', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({}, [] as any);
  expect(call).toHaveBeenCalledTimes(0);
  expect(res).toMatchObject({id: null, error: {message: 'Invalid message.'}});
});

test('returns error message on invalid message type', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({}, {x: 1, y: 2} as any);
  expect(call).toHaveBeenCalledTimes(0);
  expect(res).toMatchObject({id: null, error: {message: 'Method not specified.'}});
});

describe('strict mode', () => {
  test('throws if {"jsonrpc": "2.0"} is not provided', async () => {
    const call = jest.fn();
    const notify = jest.fn();
    const server = new JsonRpcServer<{userId?: string}>({call, notify, strict: true});
    const res = await server.onMessage({userId: '123'}, {id: '3', method: 'double', params: 3});
    expect(res).toMatchObject({jsonrpc: '2.0', id: '3', error: {message: 'Only JSON-RPC version 2.0 is supported.'}});
  });

  test('throws if {"jsonrpc": "2.0"} is not provided for notification', async () => {
    const call = jest.fn();
    const notify = jest.fn();
    const server = new JsonRpcServer<{userId?: string}>({call, notify, strict: true});
    const res = await server.onMessage({userId: '123'}, {method: 'double', params: 3});
    expect(res).toMatchObject({jsonrpc: '2.0', id: null, error: {message: 'Only JSON-RPC version 2.0 is supported.'}});
  });

  test('successful response contains {"jsonrpc": "2.0"} version', async () => {
    const call = jest.fn(async (method, ctx, payload) => {
      return 2 * payload;
    });
    const notify = jest.fn();
    const server = new JsonRpcServer<{userId?: string}>({call, notify, strict: true});
    const res = await server.onMessage({userId: '123'}, {jsonrpc: '2.0', id: 4, method: 'double', params: 3});
    expect(res).toMatchObject({jsonrpc: '2.0', id: 4, result: 6});
  });

  test('successfully notifies if {"jsonrpc": "2.0"} is provided', async () => {
    const call = jest.fn();
    const notify = jest.fn();
    const server = new JsonRpcServer<{userId?: string}>({call, notify, strict: true});
    const res = await server.onMessage({userId: '123'}, {jsonrpc: '2.0', method: 'foo', params: 25});
    expect(call).toHaveBeenCalledTimes(0);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('foo', {userId: '123'}, 25);
  });
});
