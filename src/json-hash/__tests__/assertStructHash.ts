import {structHash as structHash_} from '../structHash';
import {structHashCrdt} from '../structHashCrdt';
import {Model} from '../../json-crdt';

// biome-ignore lint: \x00 character
const isASCII = (str: string) => /^[\x00-\x7F]*$/.test(str);

export const assertStructHash = (json: unknown): string => {
  const model = Model.create();
  model.api.root(json);
  const hash1 = structHashCrdt(model.root);
  const hash2 = structHash_(json);
  // console.log(hash1);
  // console.log(hash2);
  expect(hash1).toBe(hash2);
  expect(hash2.includes('\n')).toBe(false);
  expect(isASCII(hash2)).toBe(true);
  return hash2;
};
