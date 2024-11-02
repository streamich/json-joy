import {clone as deepClone} from '@jsonjoy.com/util/lib/json-clone/clone';
import {hasOwnProperty as hasOwnProp} from '@jsonjoy.com/util/lib/hasOwnProperty';
import {findByPointer, unescapeComponent} from '@jsonjoy.com/json-pointer';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import type {Operation} from '../types';
import type {ApplyPatchOptions, OpResult, PatchResult} from './types';

const {isArray} = Array;

export function applyOperation(doc: unknown, operation: Operation): OpResult {
  const path = operation.path as string;
  const isRoot = !path;
  if (isRoot) {
    switch (operation.op) {
      case 'add':
      case 'replace':
        doc = operation.value;
        return {doc: operation.value, old: doc};
      case 'remove':
        return {doc: null, old: doc};
      case 'move': {
        const {val} = findByPointer(operation.from, doc);
        return {doc: val, old: doc};
      }
      case 'copy': {
        const {val} = findByPointer(operation.from, doc);
        return {doc: val, old: doc};
      }
      case 'test': {
        if (!deepEqual(operation.value, doc)) throw new Error('TEST');
        return {doc};
      }
    }
    return {doc};
  }
  let indexOfSlash: number = 0;
  let indexAfterSlash: number = 1;
  let obj = doc;
  let key: string | number = '';
  while (indexOfSlash > -1) {
    indexOfSlash = path.indexOf('/', indexAfterSlash);
    key = indexOfSlash > -1 ? path.substring(indexAfterSlash, indexOfSlash) : path.substring(indexAfterSlash);
    indexAfterSlash = indexOfSlash + 1;
    if (isArray(obj)) {
      const length = obj.length;
      if (key === '-') key = length;
      else {
        const key2 = ~~key;
        if ('' + key2 !== key) throw new Error('INVALID_INDEX');
        key = key2;
        if (key < 0 || key > length) throw new Error('INVALID_INDEX');
      }
      if (indexOfSlash === -1) {
        switch (operation.op) {
          case 'add': {
            const old = obj[key];
            if (key < obj.length) obj.splice(key, 0, operation.value);
            else obj.push(operation.value);
            return {doc, old};
          }
          case 'replace': {
            const old = obj[key];
            obj[key] = operation.value;
            return {doc, old};
          }
          case 'remove': {
            const old = obj[key];
            obj.splice(key as any, 1);
            return {doc, old};
          }
          case 'move': {
            const removeResult = applyOperation(doc, {op: 'remove', path: operation.from});
            return applyOperation(removeResult.doc, {op: 'add', path: operation.path, value: removeResult.old!});
          }
          case 'copy': {
            const old = obj[key];
            const {val} = findByPointer(operation.from, doc);
            const value = deepClone(val);
            if (key < obj.length) obj.splice(key, 0, value);
            else obj.push(value);
            return {doc, old};
          }
          case 'test': {
            if (!deepEqual(operation.value, obj[key])) throw new Error('TEST');
            return {doc};
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
            const old = (obj as any)[key];
            (obj as any)[key] = operation.value;
            return {doc, old};
          }
          case 'replace': {
            const old = (obj as any)[key];
            (obj as any)[key] = operation.value;
            return {doc, old};
          }
          case 'remove': {
            const old = (obj as any)[key];
            delete (obj as any)[key];
            return {doc, old};
          }
          case 'move': {
            const removeResult = applyOperation(doc, {op: 'remove', path: operation.from});
            const addResult = applyOperation(doc, {op: 'add', path: operation.path, value: removeResult.old!});
            return addResult;
          }
          case 'copy': {
            const {val} = findByPointer(operation.from, doc);
            const value = deepClone(val);
            const old = (obj as any)[key];
            (obj as any)[key] = value;
            return {doc, old};
          }
          case 'test': {
            if (!deepEqual(operation.value, (obj as any)[key])) throw new Error('TEST');
            return {doc};
          }
        }
        break;
      }
      obj = hasOwnProp(obj, key) ? (obj as any)[key] : undefined;
    } else throw new Error('NOT_FOUND');
  }
  return {doc};
}

export function applyPatch(doc: unknown, patch: readonly Operation[], options: ApplyPatchOptions): PatchResult {
  if (!options.mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  for (let i = 0; i < patch.length; i++) {
    const operation = patch[i];
    const opResult = applyOperation(doc, operation);
    res.push(opResult);
    doc = opResult.doc;
  }
  return {doc, res};
}
