import {ClockVector} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {documents} from '../../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../../__tests__/binary-documents';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';

for (const {name, json} of [...documents, ...binaryDocuments]) {
  describe('fresh encoder and decoder', () => {
    test(name, () => {
      const doc1 = Model.create(void 0, new ClockVector(222, 0));
      doc1.api.set(json);
      const encoder = new Encoder();
      const decoder = new Decoder();
      const cborDecoder = new CborDecoder();
      const [view, sidecar] = encoder.encode(doc1);
      const doc2 = decoder.decode(cborDecoder.read(view), sidecar);
      expect(doc1.view()).toEqual(json);
      expect(doc2.view()).toEqual(json);
    });
  });

  describe('shared encoder and decoder', () => {
    const encoder = new Encoder();
    const decoder = new Decoder();
    const cborDecoder = new CborDecoder();

    test(name, () => {
      const doc1 = Model.create(void 0, new ClockVector(222, 0));
      doc1.api.set(json);
      const [view, sidecar] = encoder.encode(doc1);
      const doc2 = decoder.decode(cborDecoder.read(view), sidecar);
      expect(doc1.view()).toEqual(json);
      expect(doc2.view()).toEqual(json);
    });
  });
}
