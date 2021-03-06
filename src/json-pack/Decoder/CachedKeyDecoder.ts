// This cache class is taken from https://github.com/msgpack/msgpack-javascript
// See license: https://github.com/msgpack/msgpack-javascript/blob/main/LICENSE
export function utf8DecodeJs(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
  let offset = inputOffset;
  const end = offset + byteLength;
  const units: Array<number> = [];
  let result = '';
  while (offset < end) {
    const byte1 = bytes[offset++]!;
    if ((byte1 & 0x80) === 0) {
      units.push(byte1);
    } else if ((byte1 & 0xe0) === 0xc0) {
      const byte2 = bytes[offset++]! & 0x3f;
      units.push(((byte1 & 0x1f) << 6) | byte2);
    } else if ((byte1 & 0xf0) === 0xe0) {
      const byte2 = bytes[offset++]! & 0x3f;
      const byte3 = bytes[offset++]! & 0x3f;
      units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
    } else if ((byte1 & 0xf8) === 0xf0) {
      const byte2 = bytes[offset++]! & 0x3f;
      const byte3 = bytes[offset++]! & 0x3f;
      const byte4 = bytes[offset++]! & 0x3f;
      let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
      if (unit > 0xffff) {
        unit -= 0x10000;
        units.push(((unit >>> 10) & 0x3ff) | 0xd800);
        unit = 0xdc00 | (unit & 0x3ff);
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 1000) {
      result += String.fromCharCode(...units);
      units.length = 0;
    }
  }
  if (units.length > 0) result += String.fromCharCode(...units);
  return result;
}

interface KeyCacheRecord {
  readonly bytes: Uint8Array;
  readonly value: string;
}

export class CachedKeyDecoder {
  private readonly caches: Array<Array<KeyCacheRecord>>;

  constructor() {
    this.caches = [];
    for (let i = 0; i < 31; i++) this.caches.push([]);
  }

  private get(bytes: Uint8Array, inputOffset: number, byteLength: number): string | null {
    const records = this.caches[byteLength - 1]!;
    const len = records.length;

    // FIND_CHUNK: for (const record of records) {
    FIND_CHUNK: for (let i = 0; i < len; i++) {
      const record = records[i];
      const recordBytes = record.bytes;

      for (let j = 0; j < byteLength; j++) {
        if (recordBytes[j] !== bytes[inputOffset + j]) {
          continue FIND_CHUNK;
        }
      }
      return record.value;
    }
    return null;
  }

  private store(bytes: Uint8Array, value: string) {
    const records = this.caches[bytes.length - 1]!;
    const record: KeyCacheRecord = {bytes, value};

    if (records.length >= 16) {
      // `records` are full!
      // Set `record` to a randomized position.
      records[(Math.random() * records.length) | 0] = record;
    } else {
      records.push(record);
    }
  }

  public decode(bytes: Uint8Array, offset: number, size: number): string {
    if (!size) return '';
    const cachedValue = this.get(bytes, offset, size);
    if (cachedValue != null) return cachedValue;

    const value = utf8DecodeJs(bytes, offset, size);
    // Ensure to copy a slice of bytes because the byte may be NodeJS Buffer and Buffer#slice() returns a reference to its internal ArrayBuffer.
    const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, offset, offset + size);
    this.store(slicedCopyOfBytes, value);
    return value;
  }
}
