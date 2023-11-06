/**
 * Adopted from: https://github.com/msgpack/msgpack-javascript/blob/main/src/utils/utf8.ts
 * License: https://github.com/msgpack/msgpack-javascript/blob/main/LICENSE
 *
 * @todo Rename to `utf8Size`.
 *
 * @param str JavaScript UTF-8 string.
 * @returns Length in bytes.
 */
export function utf8Count(str: string): number {
  const strLength = str.length;

  let byteLength = 0;
  let pos = 0;
  while (pos < strLength) {
    let value = str.charCodeAt(pos++);

    if ((value & 0xffffff80) === 0) {
      // 1-byte
      byteLength++;
      continue;
    } else if ((value & 0xfffff800) === 0) {
      // 2-bytes
      byteLength += 2;
    } else {
      // handle surrogate pair
      if (value >= 0xd800 && value <= 0xdbff) {
        // high surrogate
        if (pos < strLength) {
          const extra = str.charCodeAt(pos);
          if ((extra & 0xfc00) === 0xdc00) {
            ++pos;
            value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
          }
        }
      }

      if ((value & 0xffff0000) === 0) {
        // 3-byte
        byteLength += 3;
      } else {
        // 4-byte
        byteLength += 4;
      }
    }
  }
  return byteLength;
}
