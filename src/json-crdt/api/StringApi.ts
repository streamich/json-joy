import {StringType} from "../types/rga-string/StringType";
import {DocumentApi} from "./DocumentApi";

export class StringApi {
  constructor(private readonly api: DocumentApi, private readonly obj: StringType) {}

  public ins(index: number, substr: string): void {
    const {api, obj} = this;
    const {id} = obj;
    const after = !index ? id : obj.findId(index - 1);
    api.commit();
    api.builder.insStr(id, after, substr);
    api.commit();
  }

  public del(index: number, len: number): void {
    const {api, obj} = this;
    const after = obj.findId(index);
    api.commit();
    api.builder.del(obj.id, after, len);
    api.commit();
  }

  public toString(): string {
    return this.obj.toJson();
  }

  public toJson(): string {
    return this.obj.toJson();
  }
}
