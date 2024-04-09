import {hasOwnProperty} from '@jsonjoy.com/util/lib/hasOwnProperty';
import {Reference} from '../find';
import {isValidIndex, unescapeComponent} from '../util';

const {isArray} = Array;

export const findByPointer = (pointer: string, val: unknown): Reference => {
  if (!pointer) return {val};
  let obj: Reference['obj'];
  let key: Reference['key'];
  let indexOfSlash: number = 0;
  pointer = pointer.substr(1);
  while (pointer) {
    indexOfSlash = pointer.indexOf('/');
    let component: string;
    if (indexOfSlash > -1) {
      component = pointer.substring(0, indexOfSlash);
      pointer = pointer.substring(indexOfSlash + 1);
    } else {
      component = pointer;
      pointer = '';
    }
    key = unescapeComponent(component);
    obj = val;
    if (isArray(obj)) {
      if (key === '-') key = obj.length;
      else {
        if (!isValidIndex(key)) throw new Error('INVALID_INDEX');
        key = Number(key);
        if (key < 0) throw new Error('INVALID_INDEX');
      }
      val = hasOwnProperty(obj, String(key)) ? obj[key] : undefined;
    } else if (typeof obj === 'object' && !!obj) {
      val = hasOwnProperty(obj, String(key)) ? (obj as any)[key] : undefined;
    } else throw new Error('NOT_FOUND');
  }
  return {val, obj, key};
};
