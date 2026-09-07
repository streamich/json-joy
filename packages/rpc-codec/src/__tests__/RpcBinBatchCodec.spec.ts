import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {JsonJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/json';
import {RxCompactMessageCodec} from '@jsonjoy.com/rpc-codec-compact';
import {NotificationMessage} from '@jsonjoy.com/rpc-messages';
import {unknown} from '@jsonjoy.com/rpc-messages/lib/unknown';
import {RpcBinBatchCodec} from '../RpcBinBatchCodec';
import {RpcCodec} from '../RpcCodec';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

const cborCodec = () => {
  const val = new CborJsonValueCodec(new Writer(1024));
  return new RpcCodec<RxMessage>(new RxCompactMessageCodec(), val, val);
};

test('takes its id and format from the wrapped codec', () => {
  const codec = cborCodec();
  const batch = new RpcBinBatchCodec(codec);
  expect(batch.id).toBe('rpc.rx.compact.cbor');
  expect(batch.format).toBe(codec.msg.format);
});

test('round-trips a batch of messages', () => {
  const batch = new RpcBinBatchCodec(cborCodec());
  const messages = [
    new NotificationMessage('a.b', unknown({foo: 'bar'})),
    new NotificationMessage('c.d', unknown([1, 2, 3])),
  ];
  const decoded = batch.fromChunk(batch.toChunk(messages));
  expect(decoded.length).toBe(2);
  expect((decoded[0] as NotificationMessage).method).toBe('a.b');
  expect((decoded[0] as NotificationMessage).value?.data).toEqual({foo: 'bar'});
  expect((decoded[1] as NotificationMessage).value?.data).toEqual([1, 2, 3]);
});

test('keeps binary payloads binary, where a JSON codec would base64-expand them', () => {
  const blob = new Uint8Array([0, 1, 2, 250, 251, 252]);
  const messages = [new NotificationMessage('patch', unknown(blob))];
  const cbor = new RpcBinBatchCodec(cborCodec()).toChunk(messages);
  const jsonVal = new JsonJsonValueCodec(new Writer(1024));
  const json = new RpcBinBatchCodec(new RpcCodec<RxMessage>(new RxCompactMessageCodec(), jsonVal, jsonVal)).toChunk(
    messages,
  );
  expect(cbor.length).toBeLessThan(json.length);
});

test('encodes requests with the request codec and decodes with the response codec', () => {
  const req = new CborJsonValueCodec(new Writer(1024));
  const res = new JsonJsonValueCodec(new Writer(1024));
  const batch = new RpcBinBatchCodec(new RpcCodec<RxMessage>(new RxCompactMessageCodec(), req, res));
  expect(batch.id).toBe('rpc.rx.compact.cbor-json');
  const chunk = batch.toChunk([new NotificationMessage('a', unknown(1))]);
  // Encoded as CBOR, so it is not the JSON text the response side would produce.
  expect(Buffer.from(chunk).toString('utf8').startsWith('[')).toBe(false);
});
