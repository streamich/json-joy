import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {ObjNode, ArrNode, type JsonNode, ConNode} from '../nodes';
import {toPath, isChild} from '@jsonjoy.com/json-pointer/lib/util';
import {interval} from '../../json-crdt-patch/clock';
import type {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import type {Path} from '@jsonjoy.com/json-pointer/lib/types';
import type {Model} from '../model';
import type {Operation} from '../../json-patch';

export class JsonPatch<N extends JsonNode = JsonNode<any>> {
  constructor(
    protected readonly model: Model<N>,
    protected readonly pfx: Path = [],
  ) {}

  public apply(ops: Operation[]): this {
    const length = ops.length;
    this.model.api.transaction(() => {
      for (let i = 0; i < length; i++) this.applyOp(ops[i]);
    });
    return this;
  }

  public applyOp(op: Operation): this {
    switch (op.op) {
      case 'add':
        this.add(op.path, op.value);
        break;
      case 'remove':
        this.remove(op.path);
        break;
      case 'replace':
        this.replace(op.path, op.value);
        break;
      case 'move':
        this.move(op.path, op.from);
        break;
      case 'copy':
        this.copy(op.path, op.from);
        break;
      case 'test':
        this.test(op.path, op.value);
        break;
      case 'str_ins':
        this.strIns(op.path, op.pos, op.str);
        break;
      case 'str_del':
        this.strDel(op.path, op.pos, op.len ?? 0, op.str);
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

  public toPath(path: string | Path): Path {
    return this.pfx.concat(toPath(path));
  }

  public add(path: string | Path, value: unknown): void {
    const builder = this.builder();
    const steps = this.toPath(path);
    if (!steps.length) this.setRoot(value);
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjNode) {
        builder.insObj(node.id, [[String(key), builder.json(value)]]); // TODO: see if "con" nodes can be used here in some cases.
      } else if (node instanceof ArrNode) {
        const builderValue = builder.json(value);
        if (key === '-') {
          const length = node.length();
          const after = node.find(length - 1) || node.id;
          builder.insArr(node.id, after, [builderValue]);
        } else {
          const index = ~~key;
          if ('' + index !== key) throw new Error('INVALID_INDEX');
          if (!index) builder.insArr(node.id, node.id, [builderValue]);
          else {
            const after = node.find(index - 1);
            if (!after) throw new Error('NOT_FOUND');
            builder.insArr(node.id, after, [builderValue]);
          }
        }
      } else throw new Error('NOT_FOUND');
    }
  }

  public remove(path: string | Path): void {
    const builder = this.builder();
    const steps = this.toPath(path);
    if (!steps.length) this.setRoot(null);
    else {
      const objSteps = steps.slice(0, steps.length - 1);
      const node = this.model.api.find(objSteps);
      const key = steps[steps.length - 1];
      if (node instanceof ObjNode) {
        const stringKey = String(key);
        const valueNode = node.get(stringKey);
        if (valueNode === undefined) throw new Error('NOT_FOUND');
        if (valueNode instanceof ConNode && valueNode.val === undefined) throw new Error('NOT_FOUND');
        builder.insObj(node.id, [[stringKey, builder.const(undefined)]]);
      } else if (node instanceof ArrNode) {
        const key = steps[steps.length - 1];
        const index = ~~key;
        if (typeof key === 'string' && '' + index !== key) throw new Error('INVALID_INDEX');
        const id = node.find(index);
        if (!id) throw new Error('NOT_FOUND');
        builder.del(node.id, [interval(id, 0, 1)]);
      } else throw new Error('NOT_FOUND');
    }
  }

  public replace(path: string | Path, value: unknown): void {
    this.remove(path);
    this.add(path, value);
  }

  public move(path: string | Path, from: string | Path): void {
    path = toPath(path);
    from = toPath(from);
    if (isChild(from, path)) throw new Error('INVALID_CHILD');
    const json = this.json(this.toPath(from));
    this.remove(from);
    this.add(path, json);
  }

  public copy(path: string | Path, from: string | Path): void {
    path = toPath(path);
    const json = this.json(this.toPath(from));
    this.add(path, json);
  }

  public test(path: string | Path, value: unknown): void {
    path = this.toPath(path);
    const json = this.json(path);
    if (!deepEqual(json, value)) throw new Error('TEST');
  }

  public strIns(path: string | Path, pos: number, str: string): void {
    path = this.toPath(path);
    const {node} = this.model.api.str(path);
    const length = node.length();
    const after = pos ? node.find(length < pos ? length - 1 : pos - 1) : node.id;
    if (!after) throw new Error('OUT_OF_BOUNDS');
    this.builder().insStr(node.id, after, str);
  }

  public strDel(path: string | Path, pos: number, len: number, str: string = ''): void {
    path = this.toPath(path);
    const {node} = this.model.api.str(path);
    const length = node.length();
    if (length <= pos) return;
    const deletionLength = Math.min(len ?? str!.length, length - pos);
    const range = node.findInterval(pos, deletionLength);
    if (!range) throw new Error('OUT_OF_BOUNDS');
    this.builder().del(node.id, range);
  }

  public get(path: string | Path): unknown {
    return this.model.api.read(this.toPath(path));
  }

  private json(steps: Path): unknown {
    const json = this.model.api.read(steps);
    if (json === undefined) throw new Error('NOT_FOUND');
    return json;
  }

  private setRoot(json: unknown) {
    const builder = this.builder();
    builder.root(builder.json(json));
  }
}
