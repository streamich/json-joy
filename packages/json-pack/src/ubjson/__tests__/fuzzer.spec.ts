import {RandomJson} from '@jsonjoy.com/json-random';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {UbjsonEncoder} from '../UbjsonEncoder';
import {UbjsonDecoder} from '../UbjsonDecoder';
import type {JsonValue} from '../../types';

const writer = new Writer(2);
const encoder = new UbjsonEncoder(writer);
const decoder = new UbjsonDecoder();

const assertEncoder = (value: JsonValue) => {
  const encoded = encoder.encode(value);
  const json = Buffer.from(encoded).toString('utf-8');
  try {
    decoder.reader.reset(encoded);
    const decoded = decoder.readAny();
    // console.log('decoded', decoded);
    expect(decoded).toEqual(value);
  } catch (error) {
    /* tslint:disable no-console */
    console.log('value', value);
    console.log('JSON.stringify', JSON.stringify(value));
    console.log('JsonEncoder', json);
    /* tslint:enable no-console */
    throw error;
  }
};

test('fuzzing', () => {
  for (let i = 0; i < 1000; i++) {
    const json = RandomJson.generate();
    assertEncoder(json as any);
  }
}, 50000);

test('big ints', () => {
  for (let i = 0; i < 10; i++) {
    const int = BigInt(Math.round(Math.random() * Number.MAX_SAFE_INTEGER));
    assertEncoder(int);
  }
});
