import {Finder} from './Finder';
import {JsonNode} from '../../types';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {NoopOperation} from '../../../json-crdt-patch/operations/NoopOperation';
import {NULL} from '../../constants';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Path} from '../../../json-pointer';
import type {Model} from '../Model';

export class ModelApi {
  /** Buffer of accumulated patches. */
  public patches: Patch[] = [];

  /** Currently active builder. */
  public builder: PatchBuilder;

  protected getApi() {
    return this;
  }

  constructor(public readonly model: Model) {
    this.builder = new PatchBuilder(model.clock);
  }

  public getNode() {
    const model = this.model;
    const id = model.root.toValue();
    return model.node(id) || NULL;
  }

  public find(): Finder;
  public find(path: Path): JsonNode;
  public find(path?: Path): Finder | JsonNode {
    const finder = new Finder(this.getNode(), this);
    return path ? finder.find(path) : finder;
  }

  public val(path: Path) {
    return this.find().val(path);
  }

  public str(path: Path) {
    return this.find().str(path);
  }

  public bin(path: Path) {
    return this.find().bin(path);
  }

  public arr(path: Path) {
    return this.find().arr(path);
  }

  public obj(path: Path) {
    return this.find().obj(path);
  }

  public commit(): Patch {
    const patch = this.builder.patch;
    this.builder = new PatchBuilder(this.model.clock);
    if (patch.ops.length) {
      this.patches.push(patch);
      this.model.applyPatch(patch);
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

  public toView(): unknown {
    return this.getNode().toJson();
  }
}
