import {JsonPackExtension} from "../JsonPackExtension";

export class Decoder {
  protected uint8 = new Uint8Array([]);
  protected view = new DataView(this.uint8.buffer);
  protected x = 0;

  public decode(uint8: Uint8Array): unknown {
    this.x = 0;
    this.uint8 = uint8;
    this.view = new DataView(this.uint8.buffer);
    return this.val();
  }

  protected val(): unknown {
    const byte = this.u8();
    switch (byte) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;
      case 0xcc: return this.u8();
      case 0xcd: return this.u16();
      case 0xce: return this.u32();
      case 0xcf: return this.u32() * 4294967296 + this.u32();
      case 0xd0: return this.i8();
      case 0xd1: return this.i16();
      case 0xd2: return this.i32();
      case 0xd3: return this.i32() * 4294967296 + this.i32();
      case 0xca: {
        const pos = this.x;
        this.x += 4;
        return this.view.getFloat32(pos);
      }
      case 0xcb: {
        const pos = this.x;
        this.x += 8;
        return this.view.getFloat64(pos);
      }
      case 0xd9: return this.str(this.u8());
      case 0xda: return this.str(this.u16());
      case 0xdb: return this.str(this.u32());
      case 0xde: return this.obj(this.u16());
      case 0xdf: return this.obj(this.u32());
      case 0xdc: return this.arr(this.u16());
      case 0xdd: return this.arr(this.u32());
    }
    if (byte <= 0b1111111) return byte;
    switch (byte >>> 5) {
      case 0b111: return -(byte & 0b11111) - 1;
      case 0b101: return this.str(byte & 0b11111);
    }
    switch(byte >>> 4) {
      case 0b1000: return this.obj(byte & 0b1111);
      case 0b1001: return this.arr(byte & 0b1111);
    }
    switch (byte) {
      case 0xc4: return this.bin(this.u8());
      case 0xc5: return this.bin(this.u16());
      case 0xc6: return this.bin(this.u32());
      case 0xd4: return this.ext(1);
      case 0xd5: return this.ext(2);
      case 0xd6: return this.ext(4);
      case 0xd7: return this.ext(8);
      case 0xd8: return this.ext(16);
      case 0xc7: return this.ext(this.u8());
      case 0xc8: return this.ext(this.u16());
      case 0xc9: return this.ext(this.u32());
    }
    return undefined;
  }

  protected str(size: number): string {
    const uint8 = this.uint8;
    const end = this.x + size;
    let offset = this.x;
    let str = '';
    while (offset < end) {
      const byte1 = uint8[offset++]!;
      if ((byte1 & 0x80) === 0) {
        str += String.fromCharCode(byte1);
        continue;
      } else if ((byte1 & 0xe0) === 0xc0) {
        const byte2 = uint8[offset++]! & 0x3f;
        str += String.fromCharCode(((byte1 & 0x1f) << 6) | byte2);
      } else if ((byte1 & 0xf0) === 0xe0) {
        const byte2 = uint8[offset++]! & 0x3f;
        const byte3 = uint8[offset++]! & 0x3f;
        str += String.fromCharCode(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
      } else if ((byte1 & 0xf8) === 0xf0) {
        const byte2 = uint8[offset++]! & 0x3f;
        const byte3 = uint8[offset++]! & 0x3f;
        const byte4 = uint8[offset++]! & 0x3f;
        let code = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
        if (code > 0xffff) {
          code -= 0x10000;
          str += String.fromCharCode(((code >>> 10) & 0x3ff) | 0xd800);
          code = 0xdc00 | (code & 0x3ff);
        }
        str += String.fromCharCode(code);
      } else {
        str += String.fromCharCode(byte1);
      }
    }
    this.x = end;
    return str;
  }

  protected obj(size: number): object {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < size; i++) obj[this.val() as string] = this.val();
    return obj;
  }

  protected arr(size: number): unknown[] {
    const arr = [];
    for (let i = 0; i < size; i++) arr.push(this.val());
    return arr;
  }

  protected bin(size: number): Uint8Array {
    const end = this.x + size;
    const bin = this.uint8.subarray(this.x, end);
    this.x = end;
    return bin;
  }

  protected ext(size: number): JsonPackExtension {
    const type = this.u8();
    const end = this.x + size;
    const buf = this.uint8.subarray(this.x, end);
    this.x = end;
    return new JsonPackExtension(type, buf);
  }

  protected u8(): number {
    return this.view.getUint8(this.x++);
  }

  protected u16(): number {
    const num = this.view.getUint16(this.x);
    this.x += 2;
    return num;
  }

  protected u32(): number {
    const num = this.view.getUint32(this.x);
    this.x += 4;
    return num;
  }

  protected i8(): number {
    return this.view.getInt8(this.x++);
  }

  protected i16(): number {
    const num = this.view.getInt16(this.x);
    this.x += 2;
    return num;
  }

  protected i32(): number {
    const num = this.view.getInt32(this.x);
    this.x += 4;
    return num;
  }
}
