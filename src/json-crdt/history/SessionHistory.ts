import {createRace} from 'thingies/es2020/createRace';
import {FanOutUnsubscribe} from 'thingies/es2020/fanout';
import {InsValOp, Patch} from '../../json-crdt-patch';
import {ValNode} from '../nodes';
import {toSchema} from '../schema/toSchema';
import {Log} from '../log/Log';
import {RedoItem, UndoItem, UndoRedoStack} from './UndoRedoStack';
import type {LocalHistory} from './types';

class Undo implements UndoItem {
  constructor(public readonly undo: () => Redo) {}
}

class Redo implements RedoItem {
  constructor(public readonly redo: () => Undo) {}
}

export class SessionHistory {
  constructor(
    public readonly collection: string[],
    public readonly id: string,
    protected readonly local: LocalHistory,
  ) {}

  private readonly __onPatchRace = createRace();

  public attachUndoRedo(stack: UndoRedoStack): FanOutUnsubscribe {
    const onBeforePatch = (patch: Patch) => {
      this.__onPatchRace(() => {
        const undo = this.createUndo(patch);
        stack.push(undo);
      });
    };
    const unsubscribe = this.log.end.api.onBeforePatch.listen(onBeforePatch);
    return unsubscribe;
  }

  public createUndo(patch: Patch): Undo {
    const undoTasks: Array<() => void> = [];
    const ops = patch.ops;
    const length = ops.length;
    for (let i = length - 1; i >= 0; i--) {
      const op = ops[i];
      switch (op.name()) {
        case 'ins_val': {
          const insOp = op as InsValOp;
          const valNode = this.log.end.index.get(insOp.obj);
          if (!(valNode instanceof ValNode)) throw new Error('INVALID_NODE');
          const copy = toSchema(valNode.node());
          const valNodeId = valNode.id;
          const task = () => {
            const end = this.log.end;
            const valNode = end.index.get(valNodeId);
            if (!valNode) return;
            end.api.wrap(valNode).asVal().set(copy);
          };
          undoTasks.push(task);
        }
      }
    }
    const undo = new Undo(() => {
      this.__onPatchRace(() => {
        for (const task of undoTasks) task();
      });
      return new Redo(() => {
        const undo = this.__onPatchRace(() => {
          // TODO: This line needs to be changed:
          const redoPatch = Patch.fromBinary(patch.toBinary());
          this.log.end.api.builder.patch = redoPatch;
          return this.createUndo(redoPatch);
        });
        return undo!;
      });
    });
    return undo;
  }
}
