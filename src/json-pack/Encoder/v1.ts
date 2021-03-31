import {computeMaxSize} from "./util/computeMaxSize";
import {encodeAny} from "./util/encodeAny";

export class Encoder {
  public encode(json: unknown): ArrayBuffer {
    const maxSize = computeMaxSize(json);
    const buffer = new ArrayBuffer(maxSize);
    const view = new DataView(buffer);
    const offset = encodeAny(view, 0, json);
    return view.buffer.slice(0, offset);
  }
}
