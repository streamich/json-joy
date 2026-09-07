import {createRpcCallee} from '@jsonjoy.com/rpc-calls/lib/testing/Callee.fixtures';
import type * as http from 'http';
import type {CorsOpts} from '../Http1Cors';
import {Http1Server} from '../Http1Server';
import {RpcServer} from '../RpcServer';

const ORIGIN = 'https://app.example.com';

const running: http.Server[] = [];

afterEach(async () => {
  // In afterEach, not in the tests: a failed assertion must not leak a listener.
  while (running.length) {
    const server = running.pop()!;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

const setup = async (cors?: CorsOpts) => {
  const server = (await Http1Server.create()) as http.Server;
  const http1 = new Http1Server({server});
  const rpc = new RpcServer({http1, callee: createRpcCallee(), cors, logger: {log: () => {}, error: () => {}}});
  rpc.enableDefaults();
  await http1.start();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  running.push(server);
  const {port} = server.address() as {port: number};
  return 'http://127.0.0.1:' + port;
};

describe('preflight', () => {
  test('answers OPTIONS with the headers a cross-origin POST needs', async () => {
    const url = await setup();
    const res = await fetch(url + '/rx', {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
    // `application/x.rpc.*` is not a CORS-safelisted Content-Type value.
    expect(res.headers.get('access-control-allow-headers')!.toLowerCase()).toContain('content-type');
    expect(res.headers.get('access-control-max-age')).toBe('86400');
  });

  test('does not claim credentials while the origin is a wildcard', async () => {
    const url = await setup();
    const res = await fetch(url + '/rx', {method: 'OPTIONS', headers: {Origin: ORIGIN}});
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-credentials')).toBe(null);
  });

  test('honours custom methods, headers and max-age', async () => {
    const url = await setup({methods: 'POST', headers: 'Content-Type, X-Trace', maxAge: 600});
    const res = await fetch(url + '/rx', {method: 'OPTIONS', headers: {Origin: ORIGIN}});
    expect(res.headers.get('access-control-allow-methods')).toBe('POST');
    expect(res.headers.get('access-control-allow-headers')).toBe('Content-Type, X-Trace');
    expect(res.headers.get('access-control-max-age')).toBe('600');
  });
});

describe('actual responses', () => {
  test('sets the origin header on a successful RPC call', async () => {
    const url = await setup();
    const res = await fetch(url + '/rpc', {
      method: 'POST',
      headers: {Origin: ORIGIN, 'Content-Type': 'application/json'},
      body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'ping'}),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  test('sets the origin header on a route that writes its own headers', async () => {
    const url = await setup();
    const res = await fetch(url + '/schema', {headers: {Origin: ORIGIN}});
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  test('sets the origin header on the error path', async () => {
    const url = await setup();
    const res = await fetch(url + '/rpc', {
      method: 'POST',
      headers: {Origin: ORIGIN, 'Content-Type': 'application/json'},
      body: 'not json',
    });
    expect(res.status).toBe(400);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  test('sets the origin header on the not-found path', async () => {
    const url = await setup();
    const res = await fetch(url + '/nothing-here', {headers: {Origin: ORIGIN}});
    expect(res.status).toBe(404);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});

describe('origin echoing', () => {
  test('echoes the request origin and varies on it when credentials are enabled', async () => {
    const url = await setup({credentials: true});
    const res = await fetch(url + '/ping', {headers: {Origin: ORIGIN}});
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
    expect(res.headers.get('vary')).toContain('Origin');
  });

  test('sends no origin header when the request carries none', async () => {
    const url = await setup({origin: true});
    const res = await fetch(url + '/ping');
    expect(res.headers.get('access-control-allow-origin')).toBe(null);
    expect(res.headers.get('vary')).toBe(null);
  });

  test('a fixed origin is echoed verbatim, whatever the request says', async () => {
    const url = await setup({origin: ORIGIN, expose: 'X-Trace'});
    const res = await fetch(url + '/ping', {headers: {Origin: 'https://evil.example.com'}});
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(res.headers.get('access-control-expose-headers')).toBe('X-Trace');
  });
});
