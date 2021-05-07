import type {Path} from '../../json-pointer';
import type {PackedOp} from '../compact';
import type {Operation, OpType} from '../types';

export abstract class AbstractOp<O extends OpType = OpType> {
  public readonly from?: Path;

  constructor(public readonly op: O, public readonly path: Path) {}

  abstract apply(doc: unknown): {doc: unknown; old?: unknown};
  abstract toJson(): Operation;
  abstract toPacked(): PackedOp;
}
