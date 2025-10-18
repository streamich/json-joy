import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {UbjsonEncoder} from '../UbjsonEncoder';
import {UbjsonDecoder} from '../UbjsonDecoder';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';

const writer = new Writer(8);
const encoder = new UbjsonEncoder(writer);
const decoder = new UbjsonDecoder();

const assertEncoder = (value: JsonValue) => {
  const encoded = encoder.encode(value);
  // const json = Buffer.from(encoded).toString('utf-8');
  // console.log('json', json);
  decoder.reader.reset(encoded);
  const decoded = decoder.readAny();
  expect(decoded).toEqual(value);
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
