import {Path} from '../../json-pointer';
import {Operation, OpType} from '../types';
import {OPCODE} from './constants';

// [opcode, path, extra options]
export type PackedOp = [OPCODE, string | Path] | [OPCODE, string | Path, object];

export abstract class AbstractOp<O extends OpType = OpType> {
  public readonly from?: Path;

  constructor(public readonly op: O, public readonly path: Path) {}

  abstract apply(doc: unknown): {doc: unknown; old?: unknown};
  abstract toJson(): Operation;
  abstract toPacked(): PackedOp;
}
