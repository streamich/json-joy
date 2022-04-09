import {ArrayApi} from './ArrayApi';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {JsonNode} from '../../types';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {NoopOperation} from '../../../json-crdt-patch/operations/NoopOperation';
import {NULL, UNDEFINED} from '../../constants';
import {ObjectApi} from './ObjectApi';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {StringApi} from './StringApi';
import {StringType} from '../../types/rga-string/StringType';
import {ValueApi} from './ValueApi';
import {ValueType} from '../../types/lww-value/ValueType';
import type {Model} from '../Model';
import type {Path} from '../../../json-pointer';

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

  public val(path: Path): ValueApi {
    const node = this.find(path);
    if (node instanceof ValueType) return new ValueApi(this, node);
    throw new Error('NOT_VAL');
  }

  public str(path: Path): StringApi {
    const node = this.find(path);
    if (node instanceof StringType) return new StringApi(this, node);
    throw new Error('NOT_STR');
  }

  public arr(path: Path): ArrayApi {
    const node = this.find(path);
    if (node instanceof ArrayType) return new ArrayApi(this, node);
    throw new Error('NOT_ARR');
  }

  public obj(path: Path): ObjectApi {
    const obj = this.find(path);
    if (obj instanceof ObjectType) return new ObjectApi(this, obj);
    throw new Error('NOT_OBJ');
  }
}
