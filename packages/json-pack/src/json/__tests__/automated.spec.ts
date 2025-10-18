import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {JsonEncoder} from '../JsonEncoder';
import {JsonEncoderStable} from '../JsonEncoderStable';
import {JsonDecoder} from '../JsonDecoder';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';

const writer = new Writer(8);
const encoder = new JsonEncoder(writer);
const encoderStable = new JsonEncoderStable(writer);
const decoder = new JsonDecoder();

const assertEncoder = (value: JsonValue) => {
  const encoded = encoder.encode(value);
  const encoded2 = encoderStable.encode(value);
  // const json = Buffer.from(encoded).toString('utf-8');
  // console.log('json', json);
  const decoded = decoder.decode(encoded);
  const decoded2 = decoder.decode(encoded2);
  expect(decoded).toEqual(value);
  expect(decoded2).toEqual(value);
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
