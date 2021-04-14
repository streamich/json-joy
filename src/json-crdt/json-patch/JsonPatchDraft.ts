import type {Model} from "../model";
import {Draft} from "../../json-crdt-patch/Draft";
import {Op, OpAdd, OpCopy, OpMove, OpRemove, OpReplace, OpTest} from '../../json-patch/op';
import {ObjectType} from "../types/lww-object/ObjectType";
import {ArrayType} from "../types/rga-array/ArrayType";
import {UNDEFINED_ID} from "../../json-crdt-patch/constants";
import {isChild, Path} from "../../json-pointer";
const isEqual = require('fast-deep-equal');

export class JsonPatchDraft extends Draft {
  constructor(public readonly model: Model) {
    super();
  }

  public applyOps(ops: Op[]) {
    for (const op of ops) this.applyOp(op);
  }

  public applyOp(op: Op): void {
    if (op instanceof OpAdd) this.applyOpAdd(op);
    else if (op instanceof OpRemove) this.applyOpRemove(op);
    else if (op instanceof OpReplace) this.applyOpReplace(op);
    else if (op instanceof OpMove) this.applyOpMove(op);
    else if (op instanceof OpCopy) this.applyOpCopy(op);
    else if (op instanceof OpTest) this.applyOpTest(op);
  }

  public applyOpAdd(op: OpAdd): void {
    const {builder} = this;
    const steps = op.path;
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

  public applyOpRemove(op: OpRemove): void {
    const {builder} = this;
    const steps = op.path;
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

  public applyOpReplace(op: OpReplace): void {
    const {path, value} = op;
    this.applyOpRemove(new OpRemove(path, undefined));
    this.applyOpAdd(new OpAdd(path, value));
  }

  public applyOpMove(op: OpMove): void {
    const {path, from} = op;
    if (isChild(from, path)) throw new Error('INVALID_CHILD');
    const json = this.json(from);
    this.applyOpRemove(new OpRemove(from, undefined));
    this.applyOpAdd(new OpAdd(path, json));
  }

  public applyOpCopy(op: OpCopy): void {
    const {path, from} = op;
    const json = this.json(from);
    this.applyOpAdd(new OpAdd(path, json));
  }

  public applyOpTest(op: OpTest): void {
    const {path, value} = op;
    const json = this.json(path);
    if (!isEqual(json, value)) throw new Error('TEST');
  }

  private get(steps: Path): unknown {
    if (!steps.length) return this.model.toJson();
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
        return this.model.nodes.get(nodeId)?.toJson();
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
