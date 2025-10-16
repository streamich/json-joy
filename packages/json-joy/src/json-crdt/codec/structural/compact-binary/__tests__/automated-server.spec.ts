import {ClockVector} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {documents} from '../../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../../__tests__/binary-documents';

for (const {name, json} of [...documents, ...binaryDocuments]) {
  test(name, () => {
    const doc1 = Model.create(void 0, new ClockVector(222, 0));
    doc1.api.set(json);
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.view()).toEqual(json);
    expect(doc2.view()).toEqual(json);
  });
}
