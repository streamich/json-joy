import type {Model} from '../Model';
import type {Path} from '../../../json-pointer';
import {StringType} from '../../types/rga-string/StringType';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Patch} from '../../../json-crdt-patch/Patch';
import {NoopOperation} from '../../../json-crdt-patch/operations/NoopOperation';
import {LogicalTimestamp, ITimestamp} from '../../../json-crdt-patch/clock';
import {StringApi} from './StringApi';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {UNDEFINED_ID} from '../../../json-crdt-patch/constants';
import {ValueType} from '../../types/lww-value/ValueType';
import {JsonNode} from '../../types';
import {NULL, UNDEFINED} from '../../constants';

export class ModelApi {
  /** Buffer of accumulated patches. */
  public patches: Patch[] = [];

  /** Currently active builder. */
  public builder: PatchBuilder;

  constructor(private readonly doc: Model) {
    this.builder = new PatchBuilder(doc.clock);
  }

  public commit(): Patch {
    const patch = this.builder.patch;
    this.builder = new PatchBuilder(this.doc.clock);
    if (patch.ops.length) {
      this.patches.push(patch);
      this.doc.applyPatch(patch);
    }
    return patch;
  }

  public flush(): Patch[] {
    const patches = this.patches;
    this.patches = [];
    return patches;
  }

  public flushPatch(): Patch {
    const patches = this.flush();
    const length = patches.length;
    const result = new Patch();
    let prev: null | Patch = null;
    for (let i = 0; i < length; i++) {
      const patch = patches[i];
      if (!patch.ops) continue;
      if (!prev) result.ops.push(...patch.ops);
      else {
        const id = patch.getId()!;
        const nextTime = prev.nextTime();
        const gap = id.time - nextTime;
        if (gap > 0) result.ops.push(new NoopOperation(new LogicalTimestamp(id.getSessionId(), nextTime), gap));
        result.ops.push(...patch.ops);
      }
      prev = patch;
    }
    return result;
  }

  public find(steps: Path): JsonNode {
    const doc = this.doc;
    const id = doc.root.toValue();
    let node: JsonNode = doc.node(id) || NULL;
    const length = steps.length;
    if (!length) return node;
    let i = 0;
    while (i < length) {
      const step = steps[i++];
      if (node instanceof ObjectType) {
        const id = node.get(String(step));
        if (!id) return UNDEFINED;
        const nextNode = doc.node(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
      } else if (node instanceof ArrayType) {
        const id = node.findValue(Number(step));
        const nextNode = doc.node(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
        continue;
      }
    }
    return node;
  }

  public patch(cb: (api: this) => void) {
    this.commit();
    cb(this);
    this.commit();
  }

  public root(json: unknown): this {
    const value = this.builder.json(json);
    this.builder.root(value);
    return this;
  }

  public asVal(path: Path): ValueType {
    const obj = this.find(path);
    if (obj instanceof ValueType) return obj;
    throw new Error('NOT_VAL');
  }

  public str(path: Path): StringApi {
    const obj = this.find(path);
    if (obj instanceof StringType) return new StringApi(this, obj);
    throw new Error('NOT_STR');
  }

  public valSet(path: Path, value: unknown): this {
    const {id} = this.asVal(path);
    this.builder.setVal(id, value);
    return this;
  }

  public asArr(path: Path): ArrayType {
    const obj = this.find(path);
    if (obj instanceof ArrayType) return obj;
    throw new Error('NOT_ARR');
  }

  public arrIns(path: Path, index: number, values: unknown[]): this {
    const {builder} = this;
    const obj = this.asArr(path);
    const after = !index ? obj.id : obj.findId(index - 1);
    const valueIds: ITimestamp[] = [];
    for (let i = 0; i < values.length; i++) valueIds.push(builder.json(values[i]));
    builder.insArr(obj.id, after, valueIds);
    return this;
  }

  public arrDel(path: Path, index: number, length: number): this {
    const obj = this.asArr(path);
    const spans = obj.findIdSpans(index, length);
    for (const ts of spans) this.builder.del(obj.id, ts, ts.span);
    return this;
  }

  public asObj(path: Path): ObjectType {
    const obj = this.find(path);
    if (obj instanceof ObjectType) return obj;
    throw new Error('NOT_OBJ');
  }

  public objSet(path: Path, entries: Record<string, unknown>): this {
    const obj = this.asObj(path);
    const {builder} = this;
    builder.setKeys(
      obj.id,
      Object.entries(entries).map(([key, json]) => [key, builder.json(json)]),
    );
    return this;
  }

  public objDel(path: Path, keys: string[]): this {
    const obj = this.asObj(path);
    const {builder} = this;
    builder.setKeys(
      obj.id,
      keys.map((key) => [key, UNDEFINED_ID]),
    );
    return this;
  }
}
