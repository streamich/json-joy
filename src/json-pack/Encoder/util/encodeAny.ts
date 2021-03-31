import {isArrayBuffer} from "../../../util/isArrayBuffer";
import {JsonPackExtension} from "../../JsonPackExtension";
import {JsonPackValue} from "../../JsonPackValue";
import {encodeFalse, encodeNull, encodeTrue} from "./atoms";
import {encodeArray} from "./encodeArray";
import {encodeArrayBuffer} from "./encodeArrayBuffer";
import {encodeExtension} from "./encodeExtension";
import {encodeNumber} from "./encodeNumber";
import {encodeObject} from "./encodeObject";
import {encodeString} from "./encodeString";
import {writeBuffer} from "./writeBuffer";

export const encodeAny = (view: DataView, offset: number, json: unknown): number => {
  switch (json) {
    case null: return encodeNull(view, offset);
    case false: return encodeFalse(view, offset);
    case true: return encodeTrue(view, offset);
  }
  if (json instanceof Array) return encodeArray(view, offset, json);
  switch (typeof json) {
    case 'number': return encodeNumber(view, offset, json);
    case 'string': return encodeString(view, offset, json);
    case 'object': {
      if (json instanceof JsonPackValue) return writeBuffer(view, json.buf, offset);
      if (json instanceof JsonPackExtension) return encodeExtension(view, offset, json);
      if (isArrayBuffer(json)) return encodeArrayBuffer(view, offset, json);
      return encodeObject(view, offset, json as Record<string, unknown>);
    }
  }
  return offset;
};
