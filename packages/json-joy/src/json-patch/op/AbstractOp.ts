import type {CompactOpBase} from '../codec/compact/types';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {OpType} from '../opcodes';
import type {Operation} from '../types';
import type {OPCODE} from '../constants';

export abstract class AbstractOp<O extends OpType = OpType> {
  public readonly from?: Path;

  constructor(public readonly path: Path) {}

  abstract op(): O;
  abstract code(): OPCODE;
  abstract apply(doc: unknown): {doc: unknown; old?: unknown};
  abstract toJson(parent?: AbstractOp): Operation;
  abstract toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactOpBase;
}
