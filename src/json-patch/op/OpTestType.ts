import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestType, JsTypes, JsonPatchTypes} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactTestTypeOp} from '../compact';

const {isArray} = Array;

/**
 * @category JSON Predicate
 */
export class OpTestType extends AbstractPredicateOp<'test_type'> {
  constructor(path: Path, public readonly type: JsonPatchTypes[]) {
    super('test_type', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (val === null) return this.type.indexOf('null') > -1;
    if (isArray(val)) return this.type.indexOf('array') > -1;
    if (this.type.indexOf(typeof val as JsTypes) > -1) return true;
    if (typeof val === 'number' && val === Math.round(val) && this.type.indexOf('integer') > -1) return true;
    return false;
  }

  public toJson(): OperationTestType {
    const op: OperationTestType = {
      op: this.op,
      path: formatJsonPointer(this.path),
      type: this.type,
    };
    return op;
  }

  public toPacked(): CompactTestTypeOp {
    return [OPCODE.test_type, this.path, this.type];
  }
}
