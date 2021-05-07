import type {PackedOp} from '../codec/compact/types';
import type {Path} from '../../json-pointer';
import type {OpType} from '../opcodes';
import type {Operation} from '../types';

export abstract class AbstractOp<O extends OpType = OpType> {
  public readonly from?: Path;

  constructor(public readonly path: Path) {}

  abstract op(): O;
  abstract apply(doc: unknown): {doc: unknown; old?: unknown};
  abstract toJson(parent?: AbstractOp): Operation;
  abstract toPacked(): PackedOp;
}
