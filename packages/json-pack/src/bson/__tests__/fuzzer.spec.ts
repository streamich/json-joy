import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {BsonEncoder} from '../BsonEncoder';
import {BsonDecoder} from '../BsonDecoder';

const writer = new Writer(2);
const encoder = new BsonEncoder(writer);
const decoder = new BsonDecoder();

const assertEncoder = (value: JsonValue) => {
  // BSON only supports objects at the root level, so wrap non-objects
  const bsonValue = value && typeof value === 'object' && value.constructor === Object ? value : {value};
  const encoded = encoder.encode(bsonValue);
  try {
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(bsonValue);
  } catch (error) {
    /* tslint:disable no-console */
    console.log('value', value);
    console.log('bsonValue', bsonValue);
    console.log('JSON.stringify', JSON.stringify(bsonValue));
    console.log('encoded length', encoded.length);
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
