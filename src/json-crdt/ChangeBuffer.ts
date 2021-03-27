import type {Document} from "./document";
import type {Path} from "../json-pointer";
import {StringType} from "./types/rga-string/StringType";
import {PatchBuilder} from "../json-crdt-patch/PatchBuilder";

export class ChangeBuffer {
  private readonly builder: PatchBuilder;

  constructor(private readonly doc: Document) {
    this.builder = new PatchBuilder(doc.clock);
  }

  private asString(path: Path): StringType {
    const obj = this.doc.find(path);
    if (obj instanceof StringType) return obj;
    throw new Error('NOT_STRING');
  }

  public root(json: unknown) {
    let i = this.builder.patch.ops.length;
    const value = this.builder.json(json);
    this.builder.root(value);
    for (; i < this.builder.patch.ops.length; i++)
      this.doc.applyOperation(this.builder.patch.ops[i]);
  }

  public strIns(path: Path, index: number, substr: string) {
    let i = this.builder.patch.ops.length;
    const obj = this.asString(path);
    const after = !index ? obj.id : obj.findId(index);
    this.builder.insStr(obj.id, after, substr);
    for (; i < this.builder.patch.ops.length; i++)
      this.doc.applyOperation(this.builder.patch.ops[i]);
  }

  public strDel(path: Path, index: number, length: number) {
    let i = this.builder.patch.ops.length;
    const obj = this.asString(path);
    const after = obj.findId(index);
    this.builder.del(obj.id, after, length);
    for (; i < this.builder.patch.ops.length; i++)
      this.doc.applyOperation(this.builder.patch.ops[i]);
  }
}
