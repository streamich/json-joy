import {CborEncoder} from '../CborEncoder';
import {CborEncoderFast} from '../CborEncoderFast';
import {CborEncoderStable} from '../CborEncoderStable';
import {CborEncoderDag} from '../CborEncoderDag';
import {CborDecoder} from '../CborDecoder';
import {decode as deocode__} from 'cbor';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';

const decode = (x: Uint8Array) => deocode__(x);
const decoder = new CborDecoder();
const run = (encoder: CborEncoderFast) => {
  describe('JSON documents', () => {
    for (const t of documents) {
      (t.only ? test.only : test)(t.name, () => {
        const encoded = encoder.encode(t.json);
        const decoded = decode(encoded);
        expect(decoded).toEqual(t.json);
        expect(decoder.decode(encoded)).toEqual(t.json);

        // Skipping
        decoder.reader.reset(encoded);
        const start = decoder.reader.x;
        decoder.skipAny();
        const end = decoder.reader.x;
        const diff = end - start;
        expect(diff).toEqual(encoded.length);
      });
    }
  });
};

const runBinary = (encoder: CborEncoderFast) => {
  describe('binary documents', () => {
    for (const t of binaryDocuments) {
      (t.only ? test.only : test)(t.name, () => {
        const encoded = encoder.encode(t.json);
        const decoded = decoder.decode(encoded);
        expect(decoded).toEqual(t.json);

        // Skipping
        decoder.reader.reset(encoded);
        const start = decoder.reader.x;
        decoder.skipAny();
        const end = decoder.reader.x;
        const diff = end - start;
        expect(diff).toEqual(encoded.length);
      });
    }
  });
};

describe('CbroEncoder', () => {
  const encoder = new CborEncoder();
  run(encoder);
  runBinary(encoder);
});

describe('CbroEncoderFast', () => {
  const encoderFast = new CborEncoderFast();
  run(encoderFast);
});

describe('CbroEncoderStable', () => {
  const encoderFast = new CborEncoderStable();
  run(encoderFast);
});

describe('CborEncoderDag', () => {
  const encoderFast = new CborEncoderDag();
  run(encoderFast);
});
