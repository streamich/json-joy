import {StringType} from "../types/rga-string/StringType";
import {DocumentApi} from "./DocumentApi";

export class StringApi {
  constructor(private readonly api: DocumentApi, private readonly obj: StringType) {}

  public ins(index: number, substr: string): void {
    const {api} = this;
    api.commit();
    api.strObjIns(this.obj, index, substr);
    api.commit();
  }

  public del(index: number, len: number): void {
    const {api} = this;
    api.commit();
    api.strObjDel(this.obj, index, len);
    api.commit();
  }

  public toString(): string {
    return this.obj.toJson();
  }

  public toJson(): string {
    return this.obj.toJson();
  }
}
