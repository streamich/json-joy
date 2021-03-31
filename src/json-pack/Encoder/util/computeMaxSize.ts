import {isArrayBuffer} from "../../../util/isArrayBuffer";
import {JsonPackExtension} from "../../JsonPackExtension";
import {JsonPackValue} from "../../JsonPackValue";

/**
 * @param json Any JSON value
 * @returns The maximum buffer size that this JSON value could be encoded using MessagePack
 */
export const computeMaxSize = (json: unknown): number => {
  switch (json) {
    case null: return 1;
    case true: return 1;
    case false: return 1;
  }
  switch (typeof json) {
    case 'number': return 9;
    case 'string': return 5 + (json.length * 4);
    case 'object': {
      if (json instanceof Array) {
        let size = 5;
        const len = json.length;
        for (let i = 0; i < len; i++) size += computeMaxSize(json[i]);
        return size;
      }
      if (isArrayBuffer(json)) return 5 + json.byteLength;
      if (json instanceof JsonPackValue) return json.buf.byteLength;
      if (json instanceof JsonPackExtension) return 6 + json.buf.byteLength;
      let size = 5;
      const keys = Object.keys(json as object);
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        size += 5 + (key.length * 4) + computeMaxSize((json as any)[key]);
      }
      return size;
    }
  }
  return 0;
};
