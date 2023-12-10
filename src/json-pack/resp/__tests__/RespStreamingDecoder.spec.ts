import {RespStreamingDecoder} from '../RespStreamingDecoder';
import {RespEncoder} from '../RespEncoder';
import {concatList} from '../../../util/buffers/concat';
import {documents} from '../../../__tests__/json-documents';

const encoder = new RespEncoder();

test('can decode simple string', () => {
  const decoder = new RespStreamingDecoder();
  const encoded = encoder.encode('abc');
  expect(decoder.read()).toBe(undefined);
  decoder.push(encoded);
  expect(decoder.read()).toBe('abc');
  expect(decoder.read()).toBe(undefined);
  expect(decoder.read()).toBe(undefined);
});

test('can stream one byte at a time', () => {
  const decoder = new RespStreamingDecoder();
  const docs = [
    1,
    123.1234,
    -3,
    true,
    null,
    false,
    Infinity,
    NaN,
    -Infinity,
    '',
    'abc',
    'a\nb',
    'a\rb',
    'emoji: 🐶',
    '😀',
    '😀😀',
    '😀😀😀',
    new Error('123'),
    new Error('\n'),
    null,
    {},
    [{foo: -43, bar: 'a\nb'}],
  ];
  const encoded = docs.map((doc) => encoder.encode(doc));
  const decoded: unknown[] = [];
  const bufs = concatList(encoded);
  for (let i = 0; i < bufs.length; i++) {
    decoder.push(new Uint8Array([bufs[i]]));
    const read = decoder.read();
    if (read !== undefined) decoded.push(read);
  }
  expect(decoded).toEqual(docs);
});

test('can stream 49 bytes at a time', () => {
  const decoder = new RespStreamingDecoder();
  const docs = documents;
  const encoded = docs.map((doc) => encoder.encode(doc));
  const decoded: unknown[] = [];
  const bufs = concatList(encoded);
  for (let i = 0; i < bufs.length; i += 49) {
    const max = Math.min(bufs.length, i + 49);
    decoder.push(new Uint8Array(bufs.slice(i, max)));
    let read: any;
    while ((read = decoder.read()) !== undefined) decoded.push(read);
  }
  expect(decoded).toEqual(docs);
});
