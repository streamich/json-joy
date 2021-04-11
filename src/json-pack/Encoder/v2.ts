const isSafeInteger = Number.isSafeInteger;

export class Encoder {
  private buf!: ArrayBuffer;
  private uint8!: Uint8Array;
  private view!: DataView;
  private offset: number = 0;

  constructor(size: number = 1024, private readonly maxBufferSize: number = 1024 * 1024) {
    this.allocate(size);
  }

  private allocate(size: number) {
    this.buf = new ArrayBuffer(size);
    this.uint8 = new Uint8Array(this.buf);
    this.view = new DataView(this.buf);
  }

  private ensureOffset(offset: number) {
    this.view.getUint8(offset);
  }

  public encode(json: unknown): Uint8Array {
    this.offset = 0;
    try {
      this.encodeAny(json);
      return this.uint8.slice(0, this.offset);
    } catch (error) {
      if (error instanceof RangeError) {
        const nextSize = this.buf.byteLength * 2;
        if (nextSize > this.maxBufferSize) throw error;
        this.allocate(nextSize);
        return this.encode(json);
      }
      throw error;
    }
  }

  private encodeAny(json: unknown): void {
    switch (json) {
      case null:
        return this.u8(0xc0);
      case false:
        return this.u8(0xc2);
      case true:
        return this.u8(0xc3);
    }
    if (json instanceof Array) return this.encodeArray(json);
    switch (typeof json) {
      case 'number':
        return this.encodeNumber(json);
      case 'string':
        return this.encodeString(json);
      case 'object':
        return this.encodeObject(json as Record<string, unknown>);
    }
  }

  private encodeNumber(num: number) {
    if (isSafeInteger(num)) {
      if (num >= 0 && num <= 0b1111111) return this.u8(num);
      if (num < 0 && num >= -0b100000) return this.u8(0b11100000 | (-num - 1));
      if (num > 0) {
        if (num <= 0xff) return this.u16((0xcc << 8) | num);
        else if (num <= 0xffff) {
          this.uint8[this.offset++] = 0xcd;
          this.u16(num);
          return;
        } else if (num <= 0xffffffff) {
          this.uint8[this.offset++] = 0xce;
          this.u32(num);
          return;
        }
      } else {
        if (num > -0x7f) return this.u16((0xd0 << 8) | (num & 0xff));
        else if (num > -0x7fff) {
          this.uint8[this.offset++] = 0xd1;
          this.i16(num);
          return;
        } else if (num > -0x7fffffff) {
          this.uint8[this.offset++] = 0xd2;
          this.i32(num);
          return;
        }
      }
    }
    this.uint8[this.offset++] = 0xcb;
    this.view.setFloat64(this.offset, num);
    this.offset += 8;
  }

  private encodeString(str: string) {
    const length = str.length;
    const maxSize = length * 4;
    const output = this.uint8;
    let lengthOffset: number = this.offset;
    if (maxSize <= 0b11111) this.offset++;
    else if (maxSize <= 0xff) {
      output[this.offset++] = 0xd9;
      lengthOffset = this.offset;
      this.offset++;
    } else if (maxSize <= 0xffff) {
      output[this.offset++] = 0xda;
      lengthOffset = this.offset;
      this.offset += 2;
    } else {
      output[this.offset++] = 0xdb;
      lengthOffset = this.offset;
      this.offset += 4;
    }
    let offset = this.offset;
    let pos = 0;
    this.ensureOffset(offset + maxSize);
    while (pos < length) {
      let value = str.charCodeAt(pos++);
      if ((value & 0xffffff80) === 0) {
        output[offset++] = value;
        continue;
      } else if ((value & 0xfffff800) === 0) {
        output[offset++] = ((value >> 6) & 0x1f) | 0xc0;
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
          output[offset++] = ((value >> 12) & 0x0f) | 0xe0;
          output[offset++] = ((value >> 6) & 0x3f) | 0x80;
        } else {
          output[offset++] = ((value >> 18) & 0x07) | 0xf0;
          output[offset++] = ((value >> 12) & 0x3f) | 0x80;
          output[offset++] = ((value >> 6) & 0x3f) | 0x80;
        }
      }
      output[offset++] = (value & 0x3f) | 0x80;
    }
    this.offset = offset;
    if (maxSize <= 0b11111) this.view.setUint8(lengthOffset, 0b10100000 | (offset - lengthOffset - 1));
    else if (maxSize <= 0xff) this.view.setUint8(lengthOffset, offset - lengthOffset - 1);
    else if (maxSize <= 0xffff) this.view.setUint16(lengthOffset, offset - lengthOffset - 2);
    else this.view.setUint32(lengthOffset, offset - lengthOffset - 4);
  }

  private encodeArray(arr: unknown[]): void {
    const length = arr.length;
    if (length <= 0b1111) this.u8(0b10010000 | length);
    else if (length <= 0xffff) {
      this.u8(0xdc);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xdd);
      this.u32(length);
    } else return;
    for (let i = 0; i < length; i++) this.encodeAny(arr[i]);
  }

  private encodeObject(obj: Record<string, unknown>): void {
    const keys = Object.keys(obj);
    const length = keys.length;
    if (length <= 0b1111) this.u8(0b10000000 | length);
    else if (length <= 0xffff) {
      this.u8(0xde);
      this.u16(length);
    } else if (length <= 0xffffffff) {
      this.u8(0xdf);
      this.u32(length);
    } else return;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      this.encodeString(key);
      this.encodeAny(obj[key]);
    }
  }

  private u8(char: number) {
    this.view.setUint8(this.offset++, char);
  }

  private u16(word: number) {
    this.view.setUint16(this.offset, word);
    this.offset += 2;
  }

  private u32(dword: number) {
    this.view.setUint32(this.offset, dword);
    this.offset += 4;
  }

  private i16(word: number) {
    this.view.setInt16(this.offset, word);
    this.offset += 2;
  }

  private i32(dword: number) {
    this.view.setInt32(this.offset, dword);
    this.offset += 4;
  }
}
