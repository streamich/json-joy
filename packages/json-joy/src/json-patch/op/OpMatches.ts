import type {CompactMatchesOp, OPCODE_MATCHES} from '../codec/compact/types';
import type {OperationMatches, CreateRegexMatcher, RegexMatcher} from '../types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpMatches extends AbstractPredicateOp<'matches'> {
  public readonly matcher: RegexMatcher;

  // tslint:disable-next-line variable-name
  constructor(
    path: Path,
    public readonly value: string,
    public readonly ignore_case: boolean,
    createMatcher: CreateRegexMatcher,
  ) {
    super(path);
    this.matcher = createMatcher(value, ignore_case);
  }

  public op() {
    return 'matches' as const;
  }

  public code() {
    return OPCODE.matches;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactMatchesOp {
    const opcode: OPCODE_MATCHES = verbose ? 'matches' : OPCODE.matches;
    return this.ignore_case
      ? [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.value, 1]
      : [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }
}
