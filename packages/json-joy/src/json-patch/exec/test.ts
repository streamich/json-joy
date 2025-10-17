import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {find, type Path} from '@jsonjoy.com/json-pointer';

export const execTest = (path: Path, value: unknown, not: boolean, doc: unknown) => {
  const {val} = find(doc, path);
  if (val === undefined) return !!not;
  const test = deepEqual(val, value);
  return not ? !test : test;
};
