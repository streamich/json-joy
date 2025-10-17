import {Model} from '../../model';
import {equalSchema} from '..';
import {documents} from '../../../__tests__/json-documents';

const assertSchemasEqual = (a: unknown, b: unknown): void => {
  const model1 = Model.create(a);
  const model2 = Model.create(b);
  const result = equalSchema(model1.root, model2.root, false);
  expect(result).toBe(true);
};

for (const {name, json, only} of documents) {
  (only ? test.only : test)(name, () => {
    assertSchemasEqual(json, json);
  });
}
