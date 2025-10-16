import {operationToOp} from '../../json-patch/codec/json';
import {type Op, OpStrDel, OpStrIns} from '../../json-patch/op';

export const xStrIns = (ins: OpStrIns, op: Op): null | Op | Op[] => {
  if (op instanceof OpStrIns) {
    if (ins.pos > op.pos) return op;
    return operationToOp({...op.toJson(), pos: op.pos + ins.str.length}, {});
  } else if (op instanceof OpStrDel) {
    const del = op;
    if (del.pos < ins.pos) {
      const deleteLength: number = typeof del.str === 'string' ? del.str.length : del.len!;
      if (del.pos + deleteLength > ins.pos) {
        const beforeLength = ins.pos - del.pos;
        if (typeof del.str === 'string') {
          return [
            operationToOp({...del.toJson(), pos: ins.pos + ins.str.length, str: del.str.substr(beforeLength)}, {}),
            operationToOp({...del.toJson(), pos: del.pos, str: del.str.substr(0, beforeLength)}, {}),
          ];
        } else {
          return [
            operationToOp({...del.toJson(), pos: ins.pos + ins.str.length, len: deleteLength - beforeLength}, {}),
            operationToOp({...del.toJson(), pos: del.pos, len: beforeLength}, {}),
          ];
        }
      }
    }
    if (ins.pos < del.pos) return operationToOp({...op.toJson(), pos: op.pos + ins.str.length}, {});
    return op;
  }

  return op;
};
