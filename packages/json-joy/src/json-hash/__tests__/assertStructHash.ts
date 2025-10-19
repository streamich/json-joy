import {structHash as structHash_} from '../structHash';
import {structHashCrdt} from '../structHashCrdt';
import {structHashSchema} from '../structHashSchema';
import {Model} from '../../json-crdt';
import {toSchema} from '../../json-crdt/schema/toSchema';

const isASCII = (str: string) => /^[\x00-\x7F]*$/.test(str);

export const assertStructHash = (json: unknown): string => {
  const model = Model.create();
  model.api.set(json);
  const hash1 = structHashCrdt(model.root);
  const hash2 = structHash_(json);
  const schema = toSchema(model.root.child());
  const hash3 = structHashSchema(schema);
  const hash4 = structHashSchema(json);
  // console.log(hash1);
  // console.log(hash2);
  expect(hash1).toBe(hash2);
  expect(hash1).toBe(hash3);
  expect(hash1).toBe(hash4);
  expect(hash2.includes('\n')).toBe(false);
  expect(isASCII(hash2)).toBe(true);
  return hash2;
};
