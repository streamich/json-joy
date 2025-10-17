import {hasOwnProperty as has} from '@jsonjoy.com/util/lib/hasOwnProperty';
import type {Reference} from '../find';
import {unescapeComponent} from '../util';

const {isArray} = Array;

export const findByPointer = (pointer: string, val: unknown): Reference => {
  if (!pointer) return {val};
  let obj: Reference['obj'];
  let key: Reference['key'];
  let indexOfSlash = 0;
  let indexAfterSlash = 1;
  while (indexOfSlash > -1) {
    indexOfSlash = pointer.indexOf('/', indexAfterSlash);
    const component: string =
      indexOfSlash > -1 ? pointer.substring(indexAfterSlash, indexOfSlash) : pointer.substring(indexAfterSlash);
    indexAfterSlash = indexOfSlash + 1;
    key = unescapeComponent(component);
    obj = val;
    if (isArray(obj)) {
      if (key === '-') key = obj.length;
      else {
        // if (!isValidIndex(key)) throw new Error('INVALID_INDEX');
        key = ~~key;
        if (key < 0) throw new Error('INVALID_INDEX');
      }
      val = has(obj, key as any) ? obj[~~key] : undefined;
    } else if (typeof obj === 'object' && !!obj) {
      val = has(obj, key) ? (obj as any)[key] : undefined;
    } else throw new Error('NOT_FOUND');
  }
  return {val, obj, key};
};
