import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';
import {documents} from '../../../__tests__/json-documents';
import {binaryDocuments} from '../../../__tests__/binary-documents';

const docs = [...documents, ...binaryDocuments];

const encoder = new RespEncoder();
const decoder = new RespDecoder();

describe('skipping', () => {
  for (const t of docs) {
    (t.only ? test.only : test)(t.name, () => {
      encoder.writeAny(t.json);
      encoder.writeAny({foo: 'bar'});
      const encoded = encoder.writer.flush();
      decoder.reader.reset(encoded);
      decoder.skipAny();
      const decoded = decoder.val();
      expect(decoded).toEqual({foo: 'bar'});
    });
  }
});
