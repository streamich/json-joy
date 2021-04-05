import {JsonPackExtension} from "../JsonPackExtension";

const enum State {
  Array = 0,
  ObjectKey = 1,
  ObjectValue = 2,
}

class StackItem {
  public pos: number = 0;
  public key: string = '';
  constructor(public state: State, public len: number, public obj: unknown[] | Record<string, unknown>) {}
}

export class Decoder {
  protected uint8 = new Uint8Array([]);
  protected view = new DataView(this.uint8.buffer);
  protected x = 0;
  protected stack: StackItem[] = [];

  public decode(uint8: Uint8Array): unknown {
    this.x = 0;
    this.uint8 = uint8;
    this.view = new DataView(this.uint8.buffer);
    let value: unknown;
    const stack: StackItem[] = this.stack = [];
    VALUE: for (;;) {
      const byte = this.u8();
      if (byte <= 0x7F) {
        value = byte;
      }
      else if (byte <= 0x8F) {
        if (byte === 0x80) value = {};
        else {
          this.obj(byte - 0x80);
          continue VALUE;
        }
      }
      else if (byte <= 0x9F) {
        if (byte === 0x90) value = [];
        else {
          this.arr(byte - 0x90);
          continue VALUE;
        }
      }
      else if (byte <= 0xBF) {  
        value = this.str(byte - 0xA0);
      } else if (byte >= 0xD9) {
        if (byte <= 0xDC) {
          if (byte <= 0xDA) {
            if (byte === 0xDA) value = this.str(this.u16());
            else value = this.str(this.u8());
          } else {
            if (byte === 0xDC) {
              stack.push(new StackItem(State.Array, this.u16(), []));
              continue VALUE;
            } else {
              value = this.str(this.u32());
            }
          }
        } else {
          if (byte <= 0xDE) {
            if (byte === 0xDE) {
              stack.push(new StackItem(State.ObjectKey, this.u16(), {}));
              continue VALUE;
            } else {
              stack.push(new StackItem(State.Array, this.u32(), []));
              continue VALUE;
            }
          } else if (byte >= 0xE0) value = byte - 0x100;
          else { // 0xDF
            stack.push(new StackItem(State.ObjectKey, this.u32(), {}));
            continue VALUE;
          }
        } 

      } else if (byte === 0xC0) value = null;
      else if (byte === 0xC2) value = false;
      else if (byte === 0xC3) value = true;
      else if (byte === 0xCC) value = this.u8();
      else if (byte === 0xD0) value = this.i8();
      else if (byte === 0xCD) value = this.u16();
      else if (byte === 0xD1) value = this.i16();
      else if (byte === 0xCE) value = this.u32();
      else if (byte === 0xD2) value = this.i32();
      else {
        switch (byte) {
          case 0xC4: value = this.bin(this.u8()); break;
          case 0xC5: value = this.bin(this.u16()); break;
          case 0xC6: value = this.bin(this.u32()); break;
          case 0xC7: value = this.ext(this.u8()); break;
          case 0xC8: value = this.ext(this.u16()); break;
          case 0xC9: value = this.ext(this.u32()); break;
          case 0xCA: value = this.f32(); break;
          case 0xCB: value = this.f64(); break;
          case 0xCF: value = this.u32() * 4294967296 + this.u32(); break;
          case 0xD3: value = this.i32() * 4294967296 + this.u32(); break;
          case 0xD4: value = this.ext(1); break;
          case 0xD5: value = this.ext(2); break;
          case 0xD6: value = this.ext(4); break;
          case 0xD7: value = this.ext(8); break;
          case 0xD8: value = this.ext(16); break;
        }
      }
      let length: number;
      STACK: while ((length = stack.length) > 0) {
        const entry = stack[length - 1];
        switch (entry.state) {
          case State.Array: {
            const arr = entry.obj as unknown[];
            entry.pos++;
            arr.push(value);
            if (entry.pos >= entry.len) {
              stack.pop();
              value = arr;
              continue STACK;
            } else continue VALUE;
          }
          case State.ObjectKey: {
            entry.state = State.ObjectValue;
            entry.key = value as string;
            continue VALUE;
          }
          case State.ObjectValue: {
            const obj = entry.obj as Record<string, unknown>;
            obj[entry.key] = value;
            entry.pos++;
            if (entry.pos >= entry.len) {
              stack.pop();
              value = obj;
              break;
            } else {
              entry.state = State.ObjectKey;
              continue VALUE;
            }
          }
        }
      }
      return value;
    }
  }

  protected obj(size: number): void {
    this.stack.push(new StackItem(State.ObjectKey, size, {}));
  }

  protected arr(size: number): void {
    this.stack.push(new StackItem(State.Array, size, []));
  }

  protected str(size: number): string {
    const uint8 = this.uint8;
    const end = this.x + size;
    let offset = this.x;
    let str = '';
    while (offset < end) {
      const b1 = uint8[offset++]!;
      if ((b1 & 0x80) === 0) {
        str += String.fromCharCode(b1);
        continue;
      } else if ((b1 & 0xe0) === 0xc0) {
        str += String.fromCharCode(((b1 & 0x1f) << 6) | uint8[offset++]! & 0x3f);
      } else if ((b1 & 0xf0) === 0xe0) {
        str += String.fromCharCode(((b1 & 0x1f) << 12) | ((uint8[offset++]! & 0x3f) << 6) | (uint8[offset++]! & 0x3f));
      } else if ((b1 & 0xf8) === 0xf0) {
        const b2 = uint8[offset++]! & 0x3f;
        const b3 = uint8[offset++]! & 0x3f;
        const b4 = uint8[offset++]! & 0x3f;
        let code = ((b1 & 0x07) << 0x12) | (b2 << 0x0c) | (b3 << 0x06) | b4;
        if (code > 0xffff) {
          code -= 0x10000;
          str += String.fromCharCode(((code >>> 10) & 0x3ff) | 0xd800);
          code = 0xdc00 | (code & 0x3ff);
        }
        str += String.fromCharCode(code);
      } else {
        str += String.fromCharCode(b1);
      }
    }
    this.x = end;
    return str;
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

  protected f32(): number {
    const pos = this.x;
    this.x += 4;
    return this.view.getFloat32(pos);
  }

  protected f64(): number {
    const pos = this.x;
    this.x += 8;
    return this.view.getFloat64(pos);
  }
}
