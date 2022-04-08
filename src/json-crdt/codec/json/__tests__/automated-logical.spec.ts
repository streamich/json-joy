import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';
import {documents} from '../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../__tests__/binary-documents';

for (const {name, json} of [...documents, ...binaryDocuments]) {
  test(name, () => {
    const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
    doc1.api.root(json).commit();
    const encoder = new LogicalEncoder();
    const decoder = new LogicalDecoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toJson()).toEqual(json);
    expect(doc2.toJson()).toEqual(json);
  });
}
