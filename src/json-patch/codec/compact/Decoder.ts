import {Op} from "../../op";
import {decode} from "./decode";
import {CompactOp} from "./types";

export class Decoder {
  public decode(patch: CompactOp[]): Op[] {
    return decode(patch);
  }
}
