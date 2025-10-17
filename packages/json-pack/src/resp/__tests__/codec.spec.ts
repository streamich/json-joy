import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';

const run = (encoder: RespEncoder, decoder: RespDecoder) => {
  describe('JSON documents', () => {
    for (const t of documents) {
      (t.only ? test.only : test)(t.name, () => {
        const encoded = encoder.encode(t.json);
        const decoded = decoder.read(encoded);
        expect(decoded).toEqual(t.json);
      });
    }
  });
};

const runBinary = (encoder: RespEncoder, decoder: RespDecoder) => {
  describe('binary documents', () => {
    for (const t of binaryDocuments) {
      (t.only ? test.only : test)(t.name, () => {
        const encoded = encoder.encode(t.json);
        const decoded = decoder.read(encoded);
        expect(decoded).toEqual(t.json);
      });
    }
  });
};

describe('dedicated codecs', () => {
  const encoder = new RespEncoder();
  const decoder = new RespDecoder();
  run(encoder, decoder);
  runBinary(encoder, decoder);
});

const encoder = new RespEncoder();
const decoder = new RespDecoder();

describe('shared codecs', () => {
  run(encoder, decoder);
  runBinary(encoder, decoder);
});
