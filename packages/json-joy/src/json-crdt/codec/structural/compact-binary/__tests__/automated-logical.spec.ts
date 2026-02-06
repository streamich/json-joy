import {ClockVector} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {documents} from '../../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../../__tests__/binary-documents';
import {assertParents} from '../../../../model/__tests__/util';

for (const {name, json} of [...documents, ...binaryDocuments]) {
  describe('fresh encoder and decoder', () => {
    test(name, () => {
      const doc1 = Model.create(void 0, new ClockVector(222, 0));
      doc1.api.set(json);
      const encoder = new Encoder();
      const decoder = new Decoder();
      const encoded1 = encoder.encode(doc1);
      const doc2 = decoder.decode(encoded1);
      const encoded2 = encoder.encode(doc1);
      const doc3 = decoder.decode(encoded2);
      expect(doc1.view()).toEqual(json);
      expect(doc2.view()).toEqual(json);
      expect(doc3.view()).toEqual(json);
      assertParents(doc1);
      assertParents(doc2);
      assertParents(doc3);
    });
  });

  describe('shared encoder and decoder', () => {
    const encoder = new Encoder();
    const decoder = new Decoder();

    test(name, () => {
      const doc1 = Model.create(void 0, new ClockVector(222, 0));
      doc1.api.set(json);
      const encoded1 = encoder.encode(doc1);
      const doc2 = decoder.decode(encoded1);
      const encoded2 = encoder.encode(doc1);
      const doc3 = decoder.decode(encoded2);
      expect(doc1.view()).toEqual(json);
      expect(doc2.view()).toEqual(json);
      expect(doc3.view()).toEqual(json);
      assertParents(doc1);
      assertParents(doc2);
      assertParents(doc3);
    });
  });
}
