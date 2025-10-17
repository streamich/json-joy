/* tslint:disable no-string-throw */

import {hasOwnProperty as has} from '@jsonjoy.com/util/lib/hasOwnProperty';
import type {Reference} from '../find';
import {unescapeComponent} from '../util';

const {isArray} = Array;

export const findByPointer = (pointer: string, val: unknown): [Reference['obj'], Reference['key']] => {
  if (!pointer) return [val, ''];
  let obj: Reference['obj'];
  let key: Reference['key'];
  let indexOfSlash = 0;
  let indexAfterSlash = 1;
  while (indexOfSlash > -1) {
    indexOfSlash = pointer.indexOf('/', indexAfterSlash);
    key = indexOfSlash > -1 ? pointer.substring(indexAfterSlash, indexOfSlash) : pointer.substring(indexAfterSlash);
    indexAfterSlash = indexOfSlash + 1;
    obj = val;
    if (isArray(obj)) {
      if (key === '-') key = obj.length;
      else {
        key = ~~key;
        if (key < 0) throw 'INVALID_INDEX';
      }
      val = obj[key];
    } else if (typeof obj === 'object' && !!obj) {
      key = unescapeComponent(key);
      val = has(obj, key) ? (obj as any)[key] : undefined;
    } else throw 'NOT_FOUND';
  }
  return [obj, key];
};
