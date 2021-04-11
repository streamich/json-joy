import {JsonRpcRxServer} from '../JsonRpcRxServer';

test('can create server', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
});

test('does not call callback on boot', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('executes notify callback on notification message and passes context', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  await new Promise((r) => setTimeout(r, 1));
  server.onMessage({}, ['test', 123]);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('test', {}, 123);
});

test('executes notification callback synchronously and passes through context', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  server.onMessage({userId: '123'}, ['gg', {x: 'y'}]);
  server.onMessage({userId: '456'}, ['gg2', {x: 'y2'}]);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(2);
  expect(notify).toHaveBeenCalledWith('gg', {userId: '123'}, {x: 'y'});
  expect(notify).toHaveBeenCalledWith('gg2', {userId: '456'}, {x: 'y2'});
});

test('executes call callback on subscribe message', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  server.onMessage({userId: '123'}, [1, 'foo', 'bar']);
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
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({userId: '123'}, [3, 'double', 3]);
  expect(call).toHaveBeenCalledTimes(1);
  expect(res).toEqual([0, 3, {a: 6}]);
});

test('returns error message on call callback throw', async () => {
  const call = jest.fn(async (method, ctx, payload) => {
    if (method === 'double') return {a: 2 * payload};
    throw new Error(`Unknown method [${method}].`);
  });
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({userId: '123'}, [3, 'UNKNOWN', 3]);
  expect(call).toHaveBeenCalledTimes(1);
  expect(res).toEqual([-1, 3, {message: 'Unknown method [UNKNOWN].'}]);
});

test('returns error message on invalid inbound message', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({}, {} as any);
  expect(call).toHaveBeenCalledTimes(0);
  expect(res).toEqual([-1, -1, {message: 'Invalid message'}]);
});

test('returns error message on invalid message type', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  const res = await server.onMessage({}, [-25] as any);
  expect(call).toHaveBeenCalledTimes(0);
  expect(res).toEqual([-1, -1, {message: 'Invalid message'}]);
});

test('executes call callback twice when two messages are sent in a batch', async () => {
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  await server.onMessage({userId: '123'}, [
    [1, 'foo', 'bar'],
    [2, 'baz', 'qux'],
  ]);
  expect(notify).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(2);
  expect(call).toHaveBeenCalledWith('foo', {userId: '123'}, 'bar');
  expect(call).toHaveBeenCalledWith('baz', {userId: '123'}, 'qux');
});

test('returns responses to all items in a batch', async () => {
  const call = jest.fn(async (name, ctx, payload) => {
    return [name, ctx, payload];
  });
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  const results = await server.onMessage({userId: '123'}, [
    [1, 'foo', 'bar'],
    [2, 'baz', 'qux'],
  ]);
  expect(notify).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(2);
  expect(call).toHaveBeenCalledWith('foo', {userId: '123'}, 'bar');
  expect(call).toHaveBeenCalledWith('baz', {userId: '123'}, 'qux');
  expect(results).toMatchObject([
    [0, 1, ['foo', {userId: '123'}, 'bar']],
    [0, 2, ['baz', {userId: '123'}, 'qux']],
  ]);
});

test('returns responses to all items in a batch when error is thrown', async () => {
  const call = jest.fn(async (name, ctx, payload) => {
    if (name === 'foo') throw new Error('ERROR');
    return [name, ctx, payload];
  });
  const notify = jest.fn();
  const server = new JsonRpcRxServer<{userId?: string}>({call, notify});
  const results = await server.onMessage({userId: '123'}, [
    [1, 'foo', 'bar'],
    [2, 'baz', 'qux'],
  ]);
  expect(notify).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(2);
  expect(call).toHaveBeenCalledWith('foo', {userId: '123'}, 'bar');
  expect(call).toHaveBeenCalledWith('baz', {userId: '123'}, 'qux');
  expect(results).toMatchObject([
    [-1, 1, {message: 'ERROR'}],
    [0, 2, ['baz', {userId: '123'}, 'qux']],
  ]);
});
