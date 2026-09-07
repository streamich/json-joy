import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';
import {RxCompactMessageCodec} from '@jsonjoy.com/rpc-codec-compact';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import {ResponseCompleteMessage} from '@jsonjoy.com/rpc-messages';
import {unknown} from '@jsonjoy.com/rpc-messages/lib/unknown';
import {createFetchClient} from '../createFetchClient';

const URL = 'https://example.com/rx';

const serverCodec = () => {
  const val = new CborJsonValueCodec(new Writer(1024));
  return new RpcCodec<RxMessage>(new RxCompactMessageCodec(), val, val);
};

interface Call {
  url: string;
  init: RequestInit;
  messages: RxMessage[];
}

const stubFetch = (reply: (message: any) => unknown = () => 'pong') => {
  const codec = serverCodec();
  const calls: Call[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    const request = codec.decode(new Uint8Array(init.body as ArrayBuffer), codec.req);
    calls.push({url, init, messages: request});
    const responses = request.map((message: any) => new ResponseCompleteMessage(message.id, unknown(reply(message))));
    const body = codec.encode(responses as RxMessage[], codec.res);
    return {arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)};
  }) as any;
  return {calls, restore: () => void (globalThis.fetch = original)};
};

test('posts to the given URL with the CBOR compact content type', async () => {
  const {calls, restore} = stubFetch();
  const client = createFetchClient(URL);
  expect(await client.call('util.ping', undefined)).toBe('pong');
  expect(calls.length).toBe(1);
  expect(calls[0].url).toBe(URL);
  expect(calls[0].init.method).toBe('POST');
  const headers = calls[0].init.headers as Record<string, string>;
  expect(headers['Content-Type']).toBe('application/x.rpc.rx.compact.cbor');
  client.stop();
  restore();
});

test('sends no Authorization header without a token', async () => {
  const {calls, restore} = stubFetch();
  const client = createFetchClient(URL);
  await client.call('util.ping', undefined);
  expect((calls[0].init.headers as Record<string, string>).Authorization).toBe(undefined);
  client.stop();
  restore();
});

test('sends the token verbatim as the Authorization header', async () => {
  const {calls, restore} = stubFetch();
  const client = createFetchClient(URL, 'tkn.abc123');
  await client.call('util.ping', undefined);
  expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('tkn.abc123');
  client.stop();
  restore();
});

test('coalesces concurrent calls into a single POST', async () => {
  const {calls, restore} = stubFetch((message) => message.method);
  const client = createFetchClient(URL);
  const results = await Promise.all([
    client.call('a.one', undefined),
    client.call('b.two', undefined),
    client.call('c.three', undefined),
  ]);
  expect(results).toEqual(['a.one', 'b.two', 'c.three']);
  expect(calls.length).toBe(1);
  expect(calls[0].messages.length).toBe(3);
  client.stop();
  restore();
});

test('does not coalesce calls made further apart than the buffer window', async () => {
  const {calls, restore} = stubFetch();
  const client = createFetchClient(URL);
  await client.call('util.ping', undefined);
  await client.call('util.ping', undefined);
  expect(calls.length).toBe(2);
  client.stop();
  restore();
});

test('round-trips a binary payload without base64 expansion', async () => {
  const blob = new Uint8Array([0, 1, 2, 250, 251, 252]);
  const {calls, restore} = stubFetch((message) => message.value?.data);
  const client = createFetchClient(URL);
  const echoed = (await client.call('block.upd', blob)) as Uint8Array;
  expect(echoed).toEqual(blob);
  const body = Buffer.from(calls[0].init.body as Uint8Array);
  expect(body.indexOf(Buffer.from(blob))).toBeGreaterThan(-1);
  restore();
  client.stop();
});
