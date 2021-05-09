import {Op} from "../../op";
import {decode} from "./decode";
import {Operation} from "./types";

export class Decoder {
  public decode(patch: Operation[]): Op[] {
    return decode(patch);
  }
}
