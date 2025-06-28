import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {ViewDecoder} from '../ViewDecoder';
import {documents} from '../../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../../__tests__/binary-documents';

for (const {name, json} of [...documents, ...binaryDocuments]) {
  describe('fresh encoder and decoder', () => {
    test(name, () => {
      const doc1 = Model.withServerClock();
      doc1.api.set(json);
      const encoder = new Encoder();
      const decoder = new Decoder();
      const viewDecoder = new ViewDecoder();
      const encoded1 = encoder.encode(doc1);
      const doc2 = decoder.decode(encoded1);
      const encoded2 = encoder.encode(doc2);
      const doc3 = decoder.decode(encoded2);
      const json2 = viewDecoder.decode(encoded2);
      expect(doc1.view()).toEqual(json);
      expect(doc2.view()).toEqual(json);
      expect(doc3.view()).toEqual(json);
      expect(json2).toEqual(json);
      expect(doc3.clock.time).toBe(doc1.clock.time);
      expect(doc3.root.node().id.time).toBe(doc1.root.node().id.time);
    });
  });

  describe('shared encoder and decoder', () => {
    const encoder = new Encoder();
    const decoder = new Decoder();
    const viewDecoder = new ViewDecoder();

    test(name, () => {
      const doc1 = Model.withServerClock();
      doc1.api.set(json);
      const encoded1 = encoder.encode(doc1);
      const doc2 = decoder.decode(encoded1);
      const encoded2 = encoder.encode(doc2);
      const doc3 = decoder.decode(encoded2);
      const json2 = viewDecoder.decode(encoded2);
      expect(doc1.view()).toEqual(json);
      expect(doc2.view()).toEqual(json);
      expect(doc3.view()).toEqual(json);
      expect(json2).toEqual(json);
      expect(doc3.clock.time).toBe(doc1.clock.time);
      expect(doc3.root.node().id.time).toBe(doc1.root.node().id.time);
    });
  });
}
