import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {BsonEncoder} from '../BsonEncoder';
import {BsonDecoder} from '../BsonDecoder';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';

const writer = new Writer(8);
const encoder = new BsonEncoder(writer);
const decoder = new BsonDecoder();

const assertEncoder = (value: JsonValue) => {
  // BSON only supports objects at the root level, so wrap non-objects
  const bsonValue = value && typeof value === 'object' && value.constructor === Object ? value : {value};
  const encoded = encoder.encode(bsonValue);
  const decoded = decoder.decode(encoded);
  expect(decoded).toEqual(bsonValue);
};

describe('Sample JSON documents', () => {
  for (const t of documents) {
    (t.only ? test.only : test)(t.name, () => {
      assertEncoder(t.json as any);
    });
  }
});

describe('Sample binary documents', () => {
  for (const t of binaryDocuments) {
    (t.only ? test.only : test)(t.name, () => {
      assertEncoder(t.json as any);
    });
  }
});
