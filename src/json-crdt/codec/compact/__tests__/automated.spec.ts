import {VectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {documents} from '../../../../util/__tests__/json-documents';

for (const {name, json} of documents) {
  test(name, () => {
    const doc1 = new Model(new VectorClock(222, 0));
    doc1.api.root(json).commit();
    const encoder = new Encoder();
    const decoder = new Decoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toJson()).toEqual(json);
    expect(doc2.toJson()).toEqual(json);
  });
}
