import type {Document} from "../document";
import type {Path} from "../../json-pointer";
import {StringType} from "../types/rga-string/StringType";
import {PatchBuilder} from "../../json-crdt-patch/PatchBuilder";
import {Patch} from "../../json-crdt-patch/Patch";
import {NoopOperation} from "../../json-crdt-patch/operations/NoopOperation";
import {LogicalTimestamp} from "../../json-crdt-patch/clock";
import {StringApi} from "./StringApi";
import {NumberType} from "../types/lww-number/NumberType";
import {ArrayType} from "../types/rga-array/ArrayType";
import {ObjectType} from "../types/lww-object/ObjectType";
import {UNDEFINED_ID} from "../../json-crdt-patch/constants";

export class DocumentApi {
  /** Buffer of accumulated patches. */
  public patches: Patch[] = [];

  /** Currently active builder. */
  public builder: PatchBuilder;

  constructor(private readonly doc: Document) {
    this.builder = new PatchBuilder(doc.clock);
  }

  public commit(): this {
    const patch = this.builder.patch;
    this.builder = new PatchBuilder(this.doc.clock);
    if (patch.ops.length) {
      this.patches.push(patch);
      this.doc.applyPatch(patch);
    }
    return this;
  }

  public flush(): Patch[] {
    const patches = this.patches;
    this.patches = [];
    return patches;
  }

  public flushPatch(): Patch {
    const patches = this.flush()
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
        if (gap > 0) result.ops.push(new NoopOperation(new LogicalTimestamp(id.sessionId, nextTime), gap));
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

  public asStr(path: Path): StringType {
    const obj = this.doc.find(path);
    if (obj instanceof StringType) return obj;
    throw new Error('NOT_STR');
  }

  public str(path: Path): StringApi {
    const obj = this.asStr(path);
    return new StringApi(this, obj);
  }

  public strObjIns(obj: StringType, index: number, substr: string) {
    const after = !index ? obj.id : obj.findId(index - 1);
    this.builder.insStr(obj.id, after, substr);
  }

  public strIns(path: Path, index: number, substr: string): this {
    const obj = this.asStr(path);
    this.strObjIns(obj, index, substr);
    return this;
  }

  public strObjDel(obj: StringType, index: number, length: number) {
    const spans = obj.findIdSpan(index, length);
    for (const ts of spans) this.builder.del(obj.id, ts, ts.span);
  }

  public strDel(path: Path, index: number, length: number): this {
    const obj = this.asStr(path);
    this.strObjDel(obj, index, length);
    return this;
  }

  public asNum(path: Path): NumberType {
    const obj = this.doc.find(path);
    if (obj instanceof NumberType) return obj;
    throw new Error('NOT_NUM');
  }

  public numSet(path: Path, value: number): this {
    const {id} = this.asNum(path);
    this.builder.setNum(id, value);
    return this;
  }

  public asArr(path: Path): ArrayType {
    const obj = this.doc.find(path);
    if (obj instanceof ArrayType) return obj;
    throw new Error('NOT_ARR');
  }

  public arrIns(path: Path, index: number, values: unknown[]): this {
    const {builder} = this;
    const obj = this.asArr(path);
    const after = !index ? obj.id : obj.findId(index - 1);
    const valueIds: LogicalTimestamp[] = [];
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
    const obj = this.doc.find(path);
    if (obj instanceof ObjectType) return obj;
    throw new Error('NOT_OBJ');
  }

  public objSet(path: Path, entries: Record<string, unknown>): this {
    const obj = this.asObj(path);
    const {builder} = this;
    builder.setKeys(obj.id, Object.entries(entries).map(([key, json]) => [key, builder.json(json)]));
    return this;
  }

  public objDel(path: Path, keys: string[]): this {
    const obj = this.asObj(path);
    const {builder} = this;
    builder.setKeys(obj.id, keys.map(key => [key, UNDEFINED_ID]));
    return this;
  }
}
