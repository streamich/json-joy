import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationMatches} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedMatchesOp = [OPCODE.matches, string | Path, {v: string; i?: 1}];

export class OpMatches extends AbstractPredicateOp<'matches'> {
  // tslint:disable-next-line variable-name
  constructor(path: Path, public readonly value: string, public readonly ignore_case: boolean) {
    super('matches', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const reg = new RegExp(this.value, this.ignore_case ? 'i' : undefined);
    const test = reg.test(val);
    return test;
  }

  public toJson(): OperationMatches {
    const op: OperationMatches = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.ignore_case) (op as any).ignore_case = this.ignore_case;
    return op;
  }

  public toPacked(): PackedMatchesOp {
    const packed: PackedMatchesOp = [OPCODE.matches, this.path, {v: this.value}];
    if (this.ignore_case) packed[2].i = 1;
    return packed;
  }
}
