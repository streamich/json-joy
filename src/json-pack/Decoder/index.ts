import {decodeString as decodeStringRaw} from "../../util/decodeString";
import {JsonPackExtension} from "../JsonPackExtension";

export class Decoder {
  protected uint8 = new Uint8Array([]);
  protected view = new DataView(this.uint8.buffer);

  public decode(uint8: Uint8Array, offset: number): [json: unknown, offset: number] {
    this.uint8 = uint8;
    this.view = new DataView(this.uint8.buffer);
    return this.val(offset);
  }

  protected val(offset: number): [json: unknown, offset: number] {
    const byte = this.view.getUint8(offset++);
    switch (byte) {
      case 0xc0: return [null, offset];
      case 0xc2: return [false, offset];
      case 0xc3: return [true, offset];
      case 0xcc: return [this.view.getUint8(offset), offset + 1];
      case 0xcd: return [this.view.getUint16(offset), offset + 2];
      case 0xce: return [this.view.getUint32(offset), offset + 4];
      case 0xcf: return [this.view.getUint32(offset) * 4294967296 + this.view.getUint32(offset + 4), offset + 8];
      case 0xd0: return [this.view.getInt8(offset), offset + 1];
      case 0xd1: return [this.view.getInt16(offset), offset + 2];
      case 0xd2: return [this.view.getInt32(offset), offset + 4];
      case 0xd3: return [this.view.getInt32(offset) * 4294967296 + this.view.getUint32(offset + 4), offset + 8];
      case 0xca: return [this.view.getFloat32(offset), offset + 4];
      case 0xcb: return [this.view.getFloat64(offset), offset + 8];
      case 0xd9: return this.str(offset + 1, this.view.getUint8(offset));
      case 0xda: return this.str(offset + 2, this.view.getUint16(offset));
      case 0xdb: return this.str(offset + 4, this.view.getUint32(offset));
      case 0xde: return this.obj(offset + 2, this.view.getUint16(offset));
      case 0xdf: return this.obj(offset + 4, this.view.getUint32(offset));
      case 0xdc: return this.arr(offset + 2, this.view.getUint16(offset));
      case 0xdd: return this.arr(offset + 4, this.view.getUint32(offset));
    }
    if (byte <= 0b1111111) return [byte, offset];
    switch (byte >>> 5) {
      case 0b111: return [-(byte & 0b11111) - 1, offset];
      case 0b101: return this.str(offset, byte & 0b11111);
    }
    switch(byte >>> 4) {
      case 0b1000: return this.obj(offset, byte & 0b1111);
      case 0b1001: return this.arr(offset, byte & 0b1111);
    }
    switch (byte) {
      case 0xc4: return this.bin(offset + 1, this.view.getUint8(offset));
      case 0xc5: return this.bin(offset + 2, this.view.getUint16(offset));
      case 0xc6: return this.bin(offset + 4, this.view.getUint32(offset));
      case 0xd4: return this.ext(offset, 1);
      case 0xd5: return this.ext(offset, 2);
      case 0xd6: return this.ext(offset, 4);
      case 0xd7: return this.ext(offset, 8);
      case 0xd8: return this.ext(offset, 16);
      case 0xc7: return this.ext(offset + 1, this.view.getUint8(offset));
      case 0xc8: return this.ext(offset + 2, this.view.getUint16(offset));
      case 0xc9: return this.ext(offset + 4, this.view.getUint32(offset));
    }
    return [undefined, offset];
  }

  protected str(offset: number, size: number): [json: unknown, offset: number] {
    return [decodeStringRaw(this.view.buffer, offset, size), offset + size];
  }

  protected obj(offset: number, size: number): [json: unknown, offset: number] {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < size; i++) {
      const [key, off1] = this.val(offset);
      const [el, off2] = this.val(off1);
      offset = off2;
      obj[key as any] = el;
    }
    return [obj, offset];
  }

  protected arr(offset: number, size: number): [json: unknown, offset: number] {
    const arr = [];
    for (let i = 0; i < size; i++) {
      const [el, newOffset] = this.val(offset);
      arr.push(el);
      offset = newOffset;
    }
    return [arr, offset];
  }

  protected bin(offset: number, size: number): [buf: ArrayBuffer, offset: number] {
    const end = offset + size;
    return [this.view.buffer.slice(offset, end), end];
  }

  protected ext(offset: number, size: number): [ext: JsonPackExtension, offset: number] {
    const type = this.view.getUint8(offset++);
    const end = offset + size;
    const buf = this.view.buffer.slice(offset, end);
    return [new JsonPackExtension(type, buf), end];
  }
}
