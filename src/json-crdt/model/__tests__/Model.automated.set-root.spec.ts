import {Model} from '../../model';
import {documents} from '../../../__tests__/json-documents';

for (const {name, json, only} of documents) {
  (only ? test.only : test)(name, () => {
    const doc1 = Model.withServerClock(0);
    doc1.api.root(json).commit();
    expect(doc1.toView()).toEqual(json);
  });
}
