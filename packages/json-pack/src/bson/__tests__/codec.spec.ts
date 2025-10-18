import {BSON} from 'bson';
import {documents} from '../../__tests__/json-documents';
import {BsonEncoder} from '../BsonEncoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const run = (encoder: BsonEncoder) => {
  describe('JSON documents', () => {
    for (const t of documents) {
      (t.only ? test.only : test)(t.name, () => {
        const json = t.json && typeof t.json === 'object' && t.json.constructor === Object ? t.json : {json: t.json};
        const encoded = encoder.encode(json);
        const decoded = BSON.deserialize(encoded);
        expect(decoded).toEqual(json);
      });
    }
  });
};

describe('CbroEncoder', () => {
  const writer = new Writer(32);
  const encoder = new BsonEncoder(writer);
  run(encoder);
});
