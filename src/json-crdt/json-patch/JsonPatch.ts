import {deepEqual} from '../../json-equal/deepEqual';
import {isChild, Path} from '../../json-pointer';
import {ObjNode, ArrNode} from '../nodes';
import {toPath} from '../../json-pointer/util';
import type {Model} from '../model';
import type {
  Operation,
  OperationAdd,
  OperationRemove,
  OperationReplace,
  OperationMove,
  OperationCopy,
  OperationTest,
  OperationStrIns,
  OperationStrDel,
} from '../../json-patch';
import {interval} from '../../json-crdt-patch/clock';
import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';

export class JsonPatch {
  constructor(protected readonly model: Model) {}

  public apply(ops: Operation[]): this {
    const length = ops.length;
    for (let i = 0; i < length; i++) this.applyOp(ops[i]);
    return this;
  }

  public applyOp(op: Operation): this {
    switch (op.op) {
      case 'add':
        this.applyOpAdd(op);
        break;
      case 'remove':
        this.applyRemove(op);
        break;
      case 'replace':
        this.applyReplace(op);
        break;
      case 'move':
        this.applyMove(op);
        break;
      case 'copy':
        this.applyCopy(op);
        break;
      case 'test':
        this.applyTest(op);
        break;
      case 'str_ins':
        this.applyStrIns(op);
        break;
      case 'str_del':
        this.applyStrDel(op);
        break;
      default:
        throw new Error('UNKNOWN_OP');
    }
    this.model.api.apply();
    return this;
  }

  protected builder(): PatchBuilder {
    return this.model.api.builder;
  }

  public applyOpAdd(op: OperationAdd): void {
    const builder = this.builder();
    const steps = toPath(op.path);
    if (!steps.length) this.setRoot(op.value);
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjNode) {
        builder.insObj(node.id, [[String(key), builder.json(op.value)]]); // TODO: see if "con" nodes can be used here in some cases.
      } else if (node instanceof ArrNode) {
        const value = builder.json(op.value);
        if (key === '-') {
          const length = node.length();
          const after = node.find(length - 1) || node.id;
          builder.insArr(node.id, after, [value]);
        } else {
          const index = ~~key;
          if ('' + index !== key) throw new Error('INVALID_INDEX');
          if (!index) builder.insArr(node.id, node.id, [value]);
          else {
            const after = node.find(index - 1);
            if (!after) throw new Error('NOT_FOUND');
            builder.insArr(node.id, after, [value]);
          }
        }
      } else throw new Error('NOT_FOUND');
    }
  }

  public applyRemove(op: OperationRemove): void {
    const builder = this.builder();
    const steps = toPath(op.path);
    if (!steps.length) this.setRoot(null);
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjNode) {
        const stringKey = String(key);
        if (node.get(stringKey) === undefined) throw new Error('NOT_FOUND');
        builder.insObj(node.id, [[stringKey, builder.const(undefined)]]);
      } else if (node instanceof ArrNode) {
        const key = steps[steps.length - 1];
        const index = ~~key;
        if ('' + index !== key) throw new Error('INVALID_INDEX');
        const id = node.find(index);
        if (!id) throw new Error('NOT_FOUND');
        builder.del(node.id, [interval(id, 0, 1)]);
      } else throw new Error('NOT_FOUND');
    }
  }

  public applyReplace(op: OperationReplace): void {
    const {path, value} = op;
    this.applyRemove({op: 'remove', path});
    this.applyOpAdd({op: 'add', path, value});
  }

  public applyMove(op: OperationMove): void {
    const path = toPath(op.path);
    const from = toPath(op.from);
    if (isChild(from, path)) throw new Error('INVALID_CHILD');
    const json = this.json(from);
    this.applyRemove({op: 'remove', path: from});
    this.applyOpAdd({op: 'add', path, value: json});
  }

  public applyCopy(op: OperationCopy): void {
    const path = toPath(op.path);
    const from = toPath(op.from);
    const json = this.json(from);
    this.applyOpAdd({op: 'add', path, value: json});
  }

  public applyTest(op: OperationTest): void {
    const path = toPath(op.path);
    const json = this.json(path);
    if (!deepEqual(json, op.value)) throw new Error('TEST');
  }

  public applyStrIns(op: OperationStrIns): void {
    const path = toPath(op.path);
    const {node} = this.model.api.str(path);
    const length = node.length();
    const after = op.pos ? node.find(length < op.pos ? length - 1 : op.pos - 1) : node.id;
    if (!after) throw new Error('OUT_OF_BOUNDS');
    this.builder().insStr(node.id, after, op.str);
  }

  public applyStrDel(op: OperationStrDel): void {
    const path = toPath(op.path);
    const {node} = this.model.api.str(path);
    const length = node.length();
    if (length <= op.pos) return;
    const deletionLength = Math.min(op.len ?? op.str!.length, length - op.pos);
    const range = node.findInterval(op.pos, deletionLength);
    if (!range) throw new Error('OUT_OF_BOUNDS');
    this.builder().del(node.id, range);
  }

  private get(steps: Path): unknown {
    const model = this.model;
    if (!steps.length) return model.view();
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjNode) {
        return node.get(String(key))?.view();
      } else if (node instanceof ArrNode) {
        const index = ~~key;
        if ('' + index !== key) throw new Error('INVALID_INDEX');
        const arrNode = node.getNode(index);
        if (!arrNode) throw new Error('NOT_FOUND');
        return arrNode.view();
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
    const builder = this.builder();
    builder.root(builder.json(json));
  }
}
