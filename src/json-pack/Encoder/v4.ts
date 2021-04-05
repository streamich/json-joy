const isSafeInteger = Number.isSafeInteger;

export class Encoder {
  protected uint8: Uint8Array;
  protected view: DataView;
  protected offset: number = 0;

  constructor() {
    this.uint8 = new Uint8Array(1024);
    this.view = new DataView(this.uint8.buffer);
  }

  protected grow(size: number) {
    const newUint8 = new Uint8Array(size);
    newUint8.set(this.uint8);
    this.uint8 = newUint8;
    this.view = new DataView(newUint8.buffer);
  }

  protected ensureCapacity(capacity: number) {
    const size = this.offset + capacity;
    const len = this.uint8.byteLength;
    if (len < size) this.grow(Math.max(size, len * 4));
  }

  public encode(json: unknown): Uint8Array {
    this.offset = 0;
    this.encodeAny(json);
    return this.uint8.subarray(0, this.offset);
  }

  protected encodeAny(json: unknown): void {
    switch (json) {
      case null: return this.u8(0xc0);
      case false: return this.u8(0xc2);
      case true: return this.u8(0xc3);
    }
    if (json instanceof Array) return this.encodeArray(json);
    switch (typeof json) {
      case 'number': return this.encodeNumber(json);
      case 'string': return this.encodeString(json);
      case 'object': return this.encodeObject(json as Record<string, unknown>);
    }
  }

  protected encodeNumber(num: number) {
    if (isSafeInteger(num)) {
      if ((num >= 0) && (num <= 0b1111111)) return this.u8(num);
      if ((num < 0) && (num >= -0b100000)) return this.u8(0xe0 | (num + 0x20));
      if (num > 0) {
        if (num <= 0xFF) return this.u16((0xcc << 8) | num);
        else if (num <= 0xFFFF) {
          this.ensureCapacity(3);
          this.uint8[this.offset++] = 0xcd;
          this.uint8[this.offset++] = num >>> 8;
          this.uint8[this.offset++] = num & 0xFF;
          return;
        } else if (num <= 0xFFFFFFFF) {
          this.ensureCapacity(5);
          this.uint8[this.offset++] = 0xce;
          this.view.setUint32(this.offset, num);
          this.offset += 4;
          return;
        }
      } else {
        if (num > -0x7F) return this.u16((0xd0 << 8) | (num & 0xFF));
        else if (num > -0x7FFF) {
          this.ensureCapacity(3);
          this.uint8[this.offset++] = 0xd1;
          this.view.setInt16(this.offset, num);
          this.offset += 2;
          return;
        } else if (num > -0x7FFFFFFF) {
          this.ensureCapacity(5);
          this.uint8[this.offset++] = 0xd2;
          this.view.setInt32(this.offset, num);
          this.offset += 4;
          return;
        }
      }
    }
    this.ensureCapacity(9);
    this.uint8[this.offset++] = 0xcb;
    this.view.setFloat64(this.offset, num);
    this.offset += 8;
  }

  protected encodeString (str: string) {
    const length = str.length;
    const maxSize = length * 4;
    this.ensureCapacity(5 + maxSize);
    const uint8 = this.uint8;
    let lengthOffset: number = this.offset;
    if (maxSize <= 0b11111) this.offset++;
    else if (maxSize <= 0xFF) {
      uint8[this.offset++] = 0xd9;
      lengthOffset = this.offset;
      this.offset++;
    } else if (maxSize <= 0xFFFF) {
      uint8[this.offset++] = 0xda;
      lengthOffset = this.offset;
      this.offset += 2;
    } else {
      uint8[this.offset++] = 0xdb;
      lengthOffset = this.offset;
      this.offset += 4;
    }
    let offset = this.offset;
    let pos = 0;
    while (pos < length) {
      let value = str.charCodeAt(pos++);
      if ((value & 0xffffff80) === 0) {
        uint8[offset++] = value;
        continue;
      } else if ((value & 0xfffff800) === 0) {
        uint8[offset++] = ((value >> 6) & 0x1f) | 0xc0;
      } else {
        if (value >= 0xd800 && value <= 0xdbff) {
          if (pos < length) {
            const extra = str.charCodeAt(pos);
            if ((extra & 0xfc00) === 0xdc00) {
              ++pos;
              value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
            }
          }
        }
        if ((value & 0xffff0000) === 0) {
          uint8[offset++] = ((value >> 12) & 0x0f) | 0xe0;
          uint8[offset++] = ((value >> 6) & 0x3f) | 0x80;
        } else {
          uint8[offset++] = ((value >> 18) & 0x07) | 0xf0;
          uint8[offset++] = ((value >> 12) & 0x3f) | 0x80;
          uint8[offset++] = ((value >> 6) & 0x3f) | 0x80;
        }
      }
      uint8[offset++] = (value & 0x3f) | 0x80;
    }
    this.offset = offset;
    if (maxSize <= 0b11111) uint8[lengthOffset] = 0b10100000 | (offset - lengthOffset - 1);
    else if (maxSize <= 0xFF) uint8[lengthOffset] = offset - lengthOffset - 1;
    else if (maxSize <= 0xFFFF) this.view.setUint16(lengthOffset, offset - lengthOffset - 2);
    else this.view.setUint32(lengthOffset, offset - lengthOffset - 4);
  }

  protected encodeArray (arr: unknown[]): void {
    const length = arr.length;
    if (length <= 0b1111) this.u8(0b10010000 | length);
    else if (length <= 0xFFFF) {
      this.u8(0xdc);
      this.u16(length);
    } else if (length <= 0xFFFFFFFF) {
      this.u8(0xdd);
      this.u32(length);
    } else return;
    for (let i = 0; i < length; i++) this.encodeAny(arr[i]);
  }

  protected encodeObject (obj: Record<string, unknown>): void {
    const keys = Object.keys(obj);
    const length = keys.length;
    if (length <= 0b1111) this.u8(0b10000000 | length);
    else if (length <= 0xFFFF) {
      this.u8(0xde);
      this.u16(length);
    } else if (length <= 0xFFFFFFFF) {
      this.u8(0xdf);
      this.u32(length);
    } else return;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.encodeString(key);
      this.encodeAny(obj[key]);
    }
  }
  
  protected u8(char: number) {
    this.ensureCapacity(1);
    this.uint8[this.offset++] = char;
  }
  
  protected u16(word: number) {
    this.ensureCapacity(2);
    this.view.setUint16(this.offset, word);
    this.offset += 2;
  }
  
  protected u32(dword: number) {
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, dword);
    this.offset += 4;
  }
}
