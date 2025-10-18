import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {JsonEncoder} from '../JsonEncoder';
import {parse} from '../../json-binary';
import largeJson from '../../__bench__/data/json-very-large-object';

const writer = new Writer(1024 * 64);
const encoder = new JsonEncoder(writer);

const assertEncoder = (value: JsonValue) => {
  const encoded = encoder.encode(value);
  const json = Buffer.from(encoded).toString('utf-8');
  // console.log('json', json);
  const decoded = parse(json);
  expect(decoded).toEqual(value);
};

describe('should keep writing buffer memory within limits', () => {
  test('long string', () => {
    for (let i = 0; i < 1000; i++) {
      const value = {
        foo: 'a'.repeat(Math.round(32000 * Math.random()) + 10),
      };
      assertEncoder(value);
      // console.log(writer.uint8.length);
      expect(writer.uint8.length).toBeLessThan(1024 * 64 * 5 * 5);
    }
  });

  test('large object', () => {
    for (let i = 0; i < 100; i++) {
      encoder.encode(largeJson);
      // console.log(writer.uint8.length);
      expect(writer.uint8.length).toBeLessThan(1024 * 64 * 5 * 5);
    }
  });
});
