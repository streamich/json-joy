import {AbstractOp} from './AbstractOp';
import {OperationMerge} from '../types';
import {find, isArrayReference, Path, formatJsonPointer} from '../../json-pointer';
import {isTextNode, isElementNode} from '../util';
import {OPCODE} from './constants';

export type PackedMergeOp = [OPCODE.merge, string | Path, {i: number; p?: object}];

export class OpMerge extends AbstractOp<'merge'> {
  constructor(path: Path, public readonly pos: number, public readonly props: object | null) {
    super('merge', path);
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (!isArrayReference(ref)) throw new Error('INVALID_TARGET');
    if (ref.key <= 0) throw new Error('INVALID_KEY');

    const one = ref.obj[ref.key - 1];
    const two = ref.obj[ref.key];
    const merged = this.merge(one, two);

    ref.obj[ref.key - 1] = merged;
    ref.obj.splice(ref.key, 1);

    return {doc, old: [one, two]};
  }

  private merge<T>(one: T, two: T) {
    if (typeof one === 'string' && typeof two === 'string') return one + two;
    if (typeof one === 'number' && typeof two === 'number') return one + two;
    if (isTextNode(one) && isTextNode(two)) return {...one, ...two, text: one.text + two.text};
    if (isElementNode(one) && isElementNode(two)) return {...one, ...two, children: [...one.children, ...two.children]};
    return [one, two];
  }

  public toJson(): OperationMerge {
    const op: OperationMerge = {
      op: this.op,
      path: formatJsonPointer(this.path),
      pos: this.pos,
    };
    if (this.props) op.props = this.props;
    return op;
  }

  public toPacked(): PackedMergeOp {
    const packed: PackedMergeOp = [OPCODE.merge, this.path, {i: this.pos}];
    if (this.props) packed[2].p = this.props;
    return packed;
  }
}
