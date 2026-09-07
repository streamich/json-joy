import {sort} from '@jsonjoy.com/util/lib/sort/insertion2';
import {objKeyCmp} from '@jsonjoy.com/util/lib/objKeyCmp';
import {utf8Size} from '@jsonjoy.com/util/lib/strings/utf8';
import {CborEncoder} from './CborEncoder';
import {MAJOR_OVERLAY} from './constants';

const strHeaderLength = (strSize: number): 1 | 2 | 3 | 5 => {
  if (strSize <= 23) return 1;
  else if (strSize <= 0xff) return 2;
  else if (strSize <= 0xffff) return 3;
  else return 5;
};

/**
 * Orders two strings by code point, which is the order their UTF-8 encodings
 * sort in. Differs from `<` only around the surrogate range.
 */
const cmpCodePoints = (a: string, b: string): number => {
  const len1 = a.length;
  const len2 = b.length;
  const len = len1 < len2 ? len1 : len2;
  for (let i = 0; i < len; i++) {
    let c1 = a.charCodeAt(i);
    let c2 = b.charCodeAt(i);
    if (c1 === c2) continue;
    if (c1 >= 0xd800) c1 += c1 < 0xe000 ? 0x2000 : -0x800;
    if (c2 >= 0xd800) c2 += c2 < 0xe000 ? 0x2000 : -0x800;
    return c1 - c2;
  }
  return len1 - len2;
};

const isAscii = (str: string): boolean => {
  for (let i = str.length - 1; i >= 0; i--) if (str.charCodeAt(i) > 127) return false;
  return true;
};

/**
 * Insertion sort by UTF-8 byte size, then by code point. Carries the sizes
 * alongside the keys so each key is measured once, not once per comparison.
 */
const sortKeysUtf8 = (keys: string[]): void => {
  const length = keys.length;
  const sizes: number[] = [];
  for (let i = 0; i < length; i++) sizes.push(utf8Size(keys[i]));
  for (let i = 1; i < length; i++) {
    const key = keys[i];
    const size = sizes[i];
    let j = i;
    for (; j > 0; j--) {
      const size2 = sizes[j - 1];
      if (size2 < size) break;
      const key2 = keys[j - 1];
      if (size2 === size && cmpCodePoints(key2, key) <= 0) break;
      keys[j] = key2;
      sizes[j] = size2;
    }
    keys[j] = key;
    sizes[j] = size;
  }
};

/**
 * Sorts object keys the way RFC 8949 §4.2.1 requires map keys to be ordered:
 * bytewise over the encoded keys. For text strings that is UTF-8 byte length
 * first (it leads the header byte), then the UTF-8 bytes themselves. For ASCII
 * keys that is exactly what `objKeyCmp` already does, and ASCII is the common
 * case, so the slower UTF-8 aware sort is used only when some key is not.
 */
const sortKeys = (keys: string[]): void => {
  const length = keys.length;
  if (length < 2) return;
  for (let i = 0; i < length; i++) if (!isAscii(keys[i])) return sortKeysUtf8(keys);
  sort(keys, objKeyCmp);
};

/** Compares two byte ranges of the same buffer bytewise, then by length. */
const cmpRange = (buf: Uint8Array, a: number, aEnd: number, b: number, bEnd: number): number => {
  const len1 = aEnd - a;
  const len2 = bEnd - b;
  const len = len1 < len2 ? len1 : len2;
  for (let i = 0; i < len; i++) {
    const diff = buf[a + i] - buf[b + i];
    if (diff !== 0) return diff;
  }
  return len1 - len2;
};

export class CborEncoderStable extends CborEncoder {
  public writeObj(obj: Record<string, unknown>): void {
    const keys = Object.keys(obj);
    sortKeys(keys);
    const length = keys.length;
    this.writeObjHdr(length);
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.writeStr(key);
      this.writeAny(obj[key]);
    }
  }

  /**
   * Map keys can be of any type, so they are sorted by their encodings: the
   * entries are written out in insertion order first, then reordered in-place.
   */
  public writeMap(map: Map<unknown, unknown>): void {
    const size = map.size;
    this.writeMapHdr(size);
    if (size < 2) {
      map.forEach((value, key) => {
        this.writeAny(key);
        this.writeAny(value);
      });
      return;
    }
    const writer = this.writer;
    // Offsets are relative to `x0`, absolute ones shift when the buffer grows.
    const start = writer.x - writer.x0;
    const bounds: number[] = [];
    map.forEach((value, key) => {
      bounds.push(writer.x - writer.x0);
      this.writeAny(key);
      bounds.push(writer.x - writer.x0);
      this.writeAny(value);
    });
    const end = writer.x - writer.x0;
    const x0 = writer.x0;
    const uint8 = writer.uint8;
    const order: number[] = [];
    for (let i = 0; i < size; i++) order.push(i);
    sort(order, (i, j) =>
      cmpRange(uint8, x0 + bounds[i << 1], x0 + bounds[(i << 1) + 1], x0 + bounds[j << 1], x0 + bounds[(j << 1) + 1]),
    );
    const entries = uint8.slice(x0 + start, x0 + end);
    let x = x0 + start;
    for (let i = 0; i < size; i++) {
      const entry = order[i];
      const from = bounds[entry << 1];
      const to = entry === size - 1 ? end : bounds[(entry + 1) << 1];
      uint8.set(entries.subarray(from - start, to - start), x);
      x += to - from;
    }
  }

  /** @todo This implementation might be even faster than the default one, verify that. */
  public writeStr(str: string): void {
    const writer = this.writer;
    const length = str.length;
    const maxSize = length * 4;
    writer.ensureCapacity(5 + maxSize);
    const headerLengthGuess = strHeaderLength(length);
    const x0 = writer.x;
    const x1 = x0 + headerLengthGuess;
    writer.x = x1;
    const bytesWritten = writer.utf8(str);
    const uint8 = writer.uint8;
    const headerLength = strHeaderLength(bytesWritten);
    if (headerLength !== headerLengthGuess) {
      const shift = headerLength - headerLengthGuess;
      uint8.copyWithin(x1 + shift, x1, x1 + bytesWritten);
    }
    switch (headerLength) {
      case 1:
        uint8[x0] = MAJOR_OVERLAY.STR + bytesWritten;
        break;
      case 2:
        uint8[x0] = 0x78;
        uint8[x0 + 1] = bytesWritten;
        break;
      case 3: {
        uint8[x0] = 0x79;
        writer.view.setUint16(x0 + 1, bytesWritten);
        break;
      }
      case 5: {
        uint8[x0] = 0x7a;
        writer.view.setUint32(x0 + 1, bytesWritten);
        break;
      }
    }
    writer.x = x0 + headerLength + bytesWritten;
  }

  public writeUndef(): void {
    this.writeNull();
  }
}
