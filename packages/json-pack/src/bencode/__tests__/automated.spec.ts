import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BencodeEncoder} from '../BencodeEncoder';
import {BencodeDecoder} from '../BencodeDecoder';
import {utf8} from '@jsonjoy.com/buffers/lib/strings';

const writer = new Writer(8);
const encoder = new BencodeEncoder(writer);
const decoder = new BencodeDecoder();

const documents: [value: unknown, name?: string][] = [
  [0],
  [1],
  [12345],
  [-12345],
  [-4444444444444444],
  [true],
  [false],
  [null],
  [undefined],
  [utf8``, 'empty byte string'],
  [utf8`hello`, '"hello" byte string'],
  [{}, 'empty object'],
  [[], 'empty array'],
  [[1, -2, null, true, utf8`asdf`, false, utf8``, undefined], 'array with basic values'],
  [[[[]]], 'triply nested arrays'],
  [[1, [1, [1], 1], 1], 'nested arrays with values'],
  [{a: {b: {c: {d: {foo: utf8`bar`}}}}}, 'nested objects'],
];

const assertEncoder = (value: unknown) => {
  const encoded = encoder.encode(value);
  const decoded = decoder.decode(encoded);
  expect(decoded).toEqual(value);
};

describe('Sample JSON documents', () => {
  for (const [value, name] of documents) {
    test(name || String(value), () => {
      assertEncoder(value);
    });
  }
});
