import {JsonPackExtension} from '../../JsonPackExtension';
import {MsgPackEncoder} from '../MsgPackEncoder';
import {MsgPackDecoderFast} from '..';
import {documents} from '../../__tests__/json-documents';

const encoder = new MsgPackEncoder();
const encode = (x: unknown) => encoder.encode(x);
const decoder = new MsgPackDecoderFast();
const decode = (a: Uint8Array) => decoder.decode(a);

const tests: Array<{name: string; json: unknown}> = [
  ...documents,
  {
    name: 'simple ArrayBuffer',
    json: new Uint8Array([1, 2, 3]),
  },
  {
    name: 'empty ArrayBuffer',
    json: new Uint8Array([]),
  },
  {
    name: '255 byte ArrayBuffer',
    json: new Uint8Array(255),
  },
  {
    name: '256 byte ArrayBuffer',
    json: new Uint8Array(256),
  },
  {
    name: '0xFFFF byte ArrayBuffer',
    json: new Uint8Array(0xffff),
  },
  {
    name: '0xFFFF + 1 byte ArrayBuffer',
    json: new Uint8Array(0xffff + 1),
  },
  {
    name: '1 byte extension',
    json: new JsonPackExtension(1, new Uint8Array([1])),
  },
  {
    name: '2 byte extension',
    json: new JsonPackExtension(1, new Uint8Array([1, 1])),
  },
  {
    name: '4 byte extension',
    json: new JsonPackExtension(6, new Uint8Array([1, 1, 2, 5])),
  },
  {
    name: '8 byte extension',
    json: new JsonPackExtension(213, new Uint8Array([1, 1, 2, 5, 0, 0, 3, 3])),
  },
  {
    name: '16 byte extension',
    json: new JsonPackExtension(0, new Uint8Array([1, 1, 2, 5, 0, 0, 3, 3, 1, 1, 1, 1, 2, 2, 2, 2])),
  },
  {
    name: '10 byte extension',
    json: new JsonPackExtension(10, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0])),
  },
  {
    name: '255 byte extension',
    json: new JsonPackExtension(10, new Uint8Array(255)),
  },
  {
    name: '256 byte extension',
    json: new JsonPackExtension(11, new Uint8Array(256)),
  },
  {
    name: '0xFFFF byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xffff)),
  },
  {
    name: '0xFFFF + 1 byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xffff + 1)),
  },
  {
    name: '0xFFFFF byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xfffff)),
  },
];

for (const t of tests) {
  test(t.name, () => {
    const buf = encode(t.json);
    const res = decode(buf);
    expect(res).toEqual(t.json);
  });
}
