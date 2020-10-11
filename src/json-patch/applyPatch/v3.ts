/* tslint:disable no-string-throw */

import {deepClone} from '../util';
import {Operation} from '../types';
import {findByPointer, hasOwnProperty, isArrayReference, isObjectReference, isValidIndex, unescapeComponent} from '../../json-pointer';

export interface OpResult {
  doc: unknown;
  old?: unknown;
}

export interface PatchResult {
  doc: unknown;
  res: readonly OpResult[];
}

const {isArray} = Array;

export function applyPatch(doc: unknown, patch: readonly Operation[], mutate: boolean): PatchResult {
  if (!mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  for (let i = 0; i < patch.length; i++) {
    const operation = patch[i];
    const path = operation.path as string;
    const isRoot = !path;
    if (isRoot) {
      switch (operation.op) {
        case 'add':
        case 'replace':
          doc = operation.value;
          break;
        case 'remove':
          doc = null;
          break;
      }
      break;
    };
    let indexOfSlash: number = 0;
    let indexAfterSlash: number = 1;
    let obj = doc;
    let key: string | number = '';
    while (indexOfSlash > -1) {
      indexOfSlash = path.indexOf('/', indexAfterSlash);
      key = indexOfSlash > -1
        ? path.substring(indexAfterSlash, indexOfSlash)
        : path.substring(indexAfterSlash);
      indexAfterSlash = indexOfSlash + 1;
      if (indexOfSlash === -1) break;
      if (isArray(obj)) {
        if (key === '-') key = obj.length;
        else {
          key = ~~key;
          if (key < 0) throw 'INVALID_INDEX';
        }
        if (indexOfSlash === -1) {
          switch (operation.op) {
            case 'add': {
              if (key < obj.length) obj.splice(key, 0, operation.value);
              else obj.push(operation.value);
              break;
            }
            case 'replace': {
              obj[key] = operation.value;
              break;
            }
            case 'remove': {
              obj.splice(key as any, 1);
              break;
            }
            case 'move': {
              obj.splice(key as any, 1);
              break;
            }
          }
          break;
        }
        obj = obj[key];
      } else if (typeof obj === 'object' && !!obj) {
        key = unescapeComponent(key);
        if (indexOfSlash === -1) {
          switch (operation.op) {
            case 'add': {
              (obj as any)[key] = operation.value;
              break;
            }
            case 'replace': {
              (obj as any)[key] = operation.value;
              break;
            }
            case 'remove': {
              delete (obj as any)[key];
              break;
            }
          }
          break;
        }
        obj = hasOwnProperty(obj, key) ? (obj as any)[key] : undefined;
      // tslint:disable-next-line
      } else throw 'NOT_FOUND';
    }
  }
  return {doc, res};
}
