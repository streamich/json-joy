import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';
import {cloneBinary} from '../cloneBinary';

describe('automated', () => {
  for (const {name, json, only} of [...documents, ...binaryDocuments]) {
    (only ? test.only : test)(name, () => {
      const cloned = cloneBinary(json);
      if (cloned && typeof cloned === 'object') expect(cloned).not.toBe(json);
      expect(cloned).toStrictEqual(json);
    });
  }
});

test('deep copies binary contents', () => {
  const buf = new Uint8Array([1, 2, 3]);
  const obj = {foo: buf};
  const cloned = cloneBinary(obj);
  expect(cloned).toStrictEqual(obj);
  expect((cloned as any).foo).not.toBe(obj.foo);
  obj.foo[1] = 5;
  expect(obj.foo[1]).toBe(5);
  expect((cloned as any).foo[1]).toBe(2);
});
