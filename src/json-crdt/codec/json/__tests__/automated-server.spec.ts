import {Model} from '../../../model';
import {ServerEncoder} from '../ServerEncoder';
import {ServerDecoder} from '../ServerDecoder';
import {documents} from '../../../../util/__tests__/json-documents';

for (const {name, json, only} of documents) {
  (only ? test.only : test)(name, () => {
    const doc1 = Model.withServerClock(0);
    doc1.api.root(json).commit();
    const encoder = new ServerEncoder();
    const decoder = new ServerDecoder();
    const encoded = encoder.encode(doc1);
    const doc2 = decoder.decode(encoded);
    expect(doc1.toJson()).toEqual(json);
    expect(doc2.toJson()).toEqual(json);
  });
}
