/* tslint:disable no-string-throw */

import {AbstractOp} from './AbstractOp';
import {OperationAdd} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedAddOp = [OPCODE.add, string | Path, {v: unknown}];

export class OpAdd extends AbstractOp<'add'> {
  constructor(path: Path, public readonly value: unknown) {
    super('add', path);
  }

  public apply(doc: unknown) {
    const {val, key, obj} = find(doc, this.path) as any;
    const value = this.value;
    if (!obj) doc = value;
    else if (typeof key === 'string') obj[key] = value;
    else {
      const length = obj.length;
      if (key < length) obj.splice(key, 0, this.value);
      else if (key > length) throw new Error('INVALID_INDEX');
      else obj.push(this.value);
    }
    return {doc, old: val}
  }

  public toJson(): OperationAdd {
    return {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
  }

  public toPacked(): PackedAddOp {
    return [OPCODE.add, this.path, {v: this.value}];
  }
}
