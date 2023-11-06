import {Writer} from '../../../util/buffers/Writer';
import {JsonValue} from '../../types';
import {JsonEncoder} from '../JsonEncoder';
import {JsonDecoder} from '../JsonDecoder';
import {documents} from '../../../__tests__/json-documents';
import {binaryDocuments} from '../../../__tests__/binary-documents';

const writer = new Writer(8);
const encoder = new JsonEncoder(writer);
const decoder = new JsonDecoder();

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
