import type {CompactMatchesOp} from '../codec/compact/types';
import type {OperationMatches, CreateRegexMatcher, RegexMatcher} from '../types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Predicate
 */
export class OpMatches extends AbstractPredicateOp<'matches'> {
  public readonly matcher: RegexMatcher;

  // tslint:disable-next-line variable-name
  constructor(path: Path, public readonly value: string, public readonly ignore_case: boolean, createMatcher: CreateRegexMatcher) {
    super(path);
    this.matcher = createMatcher(value, ignore_case);
  }

  public op() {
    return 'matches' as 'matches';
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const test = this.matcher(val);
    return test;
  }

  public toJson(parent?: AbstractOp): OperationMatches {
    const op: OperationMatches = {
      op: 'matches',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    if (this.ignore_case) (op as any).ignore_case = this.ignore_case;
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactMatchesOp {
    return this.ignore_case
      ? [OPCODE.matches, parent ? this.path.slice(parent.path.length) : this.path, this.value, 1]
      : [OPCODE.matches, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    const ignoreCase = this.ignore_case;
    encoder.encodeArrayHeader(ignoreCase ? 4 : 3);
    encoder.u8(OPCODE.matches);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    encoder.encodeString(this.value);
    if (ignoreCase) encoder.u8(1);
  }
}
