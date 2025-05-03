import {sort} from '@jsonjoy.com/util/lib/sort/insertion';
import {hash} from "./hash";

/**
 * Produces a *structural hash* of a JSON value.
 *
 * This is a hash that is not sensitive to the order of properties in object and
 * it preserves spatial information of the JSON nodes.
 *
 * The hash is guaranteed to contain only printable ASCII characters, excluding
 * the newline character.
 * 
 * @param val A JSON value to hash.
 */
export const structHash = (val: unknown): string => {
  switch (typeof val) {
    case 'string': return hash(val).toString(36);
    case 'number':
    case 'bigint':
      return val.toString(36);
    case 'boolean':
      return val ? 'T' : 'F';
    case 'object':
      if (val === null) return 'N';
      if (Array.isArray(val)) {
        const length = val.length;
        let res = '[';
        for (let i = 0; i < length; i++) res += structHash(val[i]) + ',';
        return res + ']';
      } else if (val instanceof Uint8Array) {
        return hash(val).toString(36);
      } else {
        const keys = Object.keys(val);
        sort(keys);
        let res = '{';
        const length = keys.length;
        for (let i = 0; i < length; i++) {
          const key = keys[i];
          res += hash(key).toString(36) + ':' + structHash((val as Record<string, unknown>)[key]) + ',';
        }
        return res + '}';
      }
    default:
      return 'U';
  }
};
