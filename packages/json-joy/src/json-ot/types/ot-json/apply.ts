import {find, isArrayReference, isObjectReference} from '@jsonjoy.com/json-pointer';
import type {JsonOp} from './types';
import {evaluate as evalExpression} from '@jsonjoy.com/json-expression/lib/evaluate';
import {comparePath} from './util';
import {EDIT_TYPE} from './constants';
import {apply as applyStr} from '../ot-string-irreversible/apply';
import {apply as applyBin} from '../ot-binary-irreversible/apply';
import {Vars} from '@jsonjoy.com/json-expression/lib/Vars';

export const apply = (doc: unknown, op: JsonOp): unknown => {
  const [test, pick = [], data = [], drop = [], edit = []] = op;
  const testLength = test.length;
  if (testLength) {
    const expressionContext = {vars: new Vars(doc)};
    for (let i = 0; i < testLength; i++) {
      const testExpr = test[i];
      const testValue = evalExpression(testExpr, expressionContext);
      if (!testValue) throw new Error('TEST');
    }
  }
  const registers = new Map<number, unknown>();
  const picksSorted = pick.sort((a, b) => comparePath(a[1], b[1]));
  for (const [regId, path] of picksSorted) {
    const ref = find(doc, path);
    if (isArrayReference(ref)) {
      const {obj, key, val} = ref;
      obj.splice(key, 1);
      registers.set(regId, val);
    } else if (isObjectReference(ref)) {
      const {obj, key, val} = ref;
      delete obj[key];
      registers.set(regId, val);
    } else {
      doc = undefined;
      registers.set(regId, ref.val);
    }
  }
  for (const [regId, value] of data) registers.set(regId, value);
  const dropsSorted = drop.sort((a, b) => comparePath(b[1], a[1]));
  for (const [regId, where] of dropsSorted) {
    const value = registers.get(regId);
    if (!where.length) {
      doc = value;
      continue;
    }
    const path = where.slice(0, -1);
    const {val} = find(doc, path);
    if (val instanceof Array) {
      let index = where[where.length - 1];
      if (index === '-') index = val.length;
      const index2 = ~~index;
      if (typeof index === 'string') if ('' + index2 !== index) throw new Error('INVALID_INDEX');
      if (index2 > val.length || index2 < -1) throw new Error('INVALID_INDEX');
      if (index2 === -1 || index2 === val.length) val.push(value);
      else val.splice(index2, 0, value);
    } else if (val && typeof val === 'object') {
      const key = where[where.length - 1];
      (val as any)[key] = value;
    } else {
      throw new Error('NOT_FOUND');
    }
  }
  for (const [type, path, operation] of edit) {
    const {val, obj, key} = find(doc, path);
    let newVal: unknown;
    switch (type) {
      case EDIT_TYPE.OT_STRING: {
        if (typeof val !== 'string') throw new Error('NOT_STR');
        newVal = applyStr(val, operation);
        break;
      }
      case EDIT_TYPE.OT_BINARY: {
        if (!(val instanceof Uint8Array)) throw new Error('NOT_BIN');
        newVal = applyBin(val, operation);
        break;
      }
    }
    if (!obj) doc = newVal;
    else (obj as any)[key as any] = newVal;
  }
  return doc;
};
