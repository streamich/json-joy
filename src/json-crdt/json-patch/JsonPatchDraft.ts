import {ArrayType} from '../types/rga-array/ArrayType';
import {deepEqual} from '../../json-equal/deepEqual';
import {Draft} from '../../json-crdt-patch/Draft';
import {isChild, Path} from '../../json-pointer';
import {ObjectType} from '../types/lww-object/ObjectType';
import {UNDEFINED_ID} from '../../json-crdt-patch/constants';
import {toPath} from '../../json-pointer/util';
import type {Model} from '../model';
import type {Operation, OperationAdd, OperationRemove, OperationReplace, OperationMove, OperationCopy, OperationTest} from '../../json-patch';

export class JsonPatchDraft extends Draft {
  constructor(public readonly model: Model) {
    super();
  }

  public applyOps(ops: Operation[]) {
    for (const op of ops) this.applyOp(op);
  }

  public applyOp(op: Operation): void {
    switch(op.op) {
      case 'add': this.applyOpAdd(op); break;
      case 'remove': this.applyOpRemove(op); break;
      case 'replace': this.applyOpReplace(op); break;
      case 'move': this.applyOpMove(op); break;
      case 'copy': this.applyOpCopy(op); break;
      case 'test': this.applyOpTest(op); break;
    }
  }

  public applyOpAdd(op: OperationAdd): void {
    const {builder} = this;
    const steps = toPath(op.path);
    if (!steps.length) this.setRoot(op.value);
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjectType) {
        builder.setKeys(node.id, [[String(key), builder.json(op.value)]]);
      } else if (node instanceof ArrayType) {
        const value = builder.json(op.value);
        if (key === '-') {
          const length = node.size();
          const after = node.findId(length);
          builder.insArr(node.id, after, [value]);
        } else {
          const index = ~~key;
          if ('' + index !== key) throw new Error('INVALID_INDEX');
          if (!index) builder.insArr(node.id, node.id, [value]);
          else {
            const after = node.findId(index - 1);
            builder.insArr(node.id, after, [value]);
          }
        }
      } else throw new Error('NOT_FOUND');
    }
  }

  public applyOpRemove(op: OperationRemove): void {
    const {builder} = this;
    const steps = toPath(op.path);
    if (!steps.length) this.setRoot(null);
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjectType) {
        const stringKey = String(key);
        if (node.get(stringKey) === undefined) throw new Error('NOT_FOUND');
        builder.setKeys(node.id, [[stringKey, UNDEFINED_ID]]);
      } else if (node instanceof ArrayType) {
        const key = steps[steps.length - 1];
        const index = ~~key;
        if ('' + index !== key) throw new Error('INVALID_INDEX');
        const id = node.findId(index);
        builder.del(node.id, id, 1);
      } else throw new Error('NOT_FOUND');
    }
  }

  public applyOpReplace(op: OperationReplace): void {
    const {path, value} = op;
    this.applyOpRemove({op: 'remove', path});
    this.applyOpAdd({op: 'add', path, value});
  }

  public applyOpMove(op: OperationMove): void {
    const path = toPath(op.path);
    const from = toPath(op.from);
    if (isChild(from, path)) throw new Error('INVALID_CHILD');
    const json = this.json(from);
    this.applyOpRemove({op: 'remove', path: from});
    this.applyOpAdd({op: 'add', path, value: json});
  }

  public applyOpCopy(op: OperationCopy): void {
    const path = toPath(op.path);
    const from = toPath(op.from);
    const json = this.json(from);
    this.applyOpAdd({op: 'add', path, value: json});
  }

  public applyOpTest(op: OperationTest): void {
    const path = toPath(op.path);
    const json = this.json(path);
    if (!deepEqual(json, op.value)) throw new Error('TEST');
  }

  private get(steps: Path): unknown {
    if (!steps.length) return this.model.toView();
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjectType) {
        return node.getNode(String(key))?.toJson();
      } else if (node instanceof ArrayType) {
        const index = ~~key;
        if ('' + index !== key) throw new Error('INVALID_INDEX');
        const nodeId = node.findValue(index);
        return this.model.node(nodeId)?.toJson();
      }
    }
    return undefined;
  }

  private json(steps: Path): unknown {
    const json = this.get(steps);
    if (json === undefined) throw new Error('NOT_FOUND');
    return json;
  }

  private setRoot(json: unknown) {
    const {builder} = this;
    builder.root(builder.json(json));
  }
}
