import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';
import {RespStreamingDecoder} from '../RespStreamingDecoder';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';

const docs = [...documents, ...binaryDocuments];

const encoder = new RespEncoder();
const decoder = new RespDecoder();
const streamingDecoder = new RespStreamingDecoder();

describe('skipping', () => {
  describe('RespDecoder', () => {
    for (const t of docs) {
      (t.only ? test.only : test)(t.name, () => {
        encoder.writeAny(t.json);
        encoder.writeAny({foo: 'bar'});
        const encoded = encoder.writer.flush();
        decoder.reader.reset(encoded);
        decoder.skipAny();
        const decoded = decoder.readAny();
        expect(decoded).toEqual({foo: 'bar'});
      });
    }
  });

  describe('RespStreamingDecoder', () => {
    for (const t of docs) {
      (t.only ? test.only : test)(t.name, () => {
        encoder.writeAny(t.json);
        encoder.writeAny({foo: 'bar'});
        const encoded = encoder.writer.flush();
        streamingDecoder.push(encoded);
        streamingDecoder.skip();
        const decoded = streamingDecoder.read();
        expect(decoded).toEqual({foo: 'bar'});
      });
    }
  });
});
