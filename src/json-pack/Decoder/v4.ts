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

  public decode(uint8: Uint8Array): unknown {
    this.x = 0;
    this.uint8 = uint8;
    this.view = new DataView(this.uint8.buffer);
    let value: unknown;
    const stack: StackItem[] = [];
    VALUE: while (true) {
      const byte = this.u8();
      switch (byte) {
        case 0x00: value = 0x00; break;
        case 0x01: value = 0x01; break;
        case 0x02: value = 0x02; break;
        case 0x03: value = 0x03; break;
        case 0x04: value = 0x04; break;
        case 0x05: value = 0x05; break;
        case 0x06: value = 0x06; break;
        case 0x07: value = 0x07; break;
        case 0x08: value = 0x08; break;
        case 0x09: value = 0x09; break;
        case 0x0A: value = 0x0A; break;
        case 0x0B: value = 0x0B; break;
        case 0x0C: value = 0x0C; break;
        case 0x0D: value = 0x0D; break;
        case 0x0E: value = 0x0E; break;
        case 0x0F: value = 0x0F; break;

        case 0x10: value = 0x10; break;
        case 0x11: value = 0x11; break;
        case 0x12: value = 0x12; break;
        case 0x13: value = 0x13; break;
        case 0x14: value = 0x14; break;
        case 0x15: value = 0x15; break;
        case 0x16: value = 0x16; break;
        case 0x17: value = 0x17; break;
        case 0x18: value = 0x18; break;
        case 0x19: value = 0x19; break;
        case 0x1A: value = 0x1A; break;
        case 0x1B: value = 0x1B; break;
        case 0x1C: value = 0x1C; break;
        case 0x1D: value = 0x1D; break;
        case 0x1E: value = 0x1E; break;
        case 0x1F: value = 0x1F; break;

        case 0x20: value = 0x20; break;
        case 0x21: value = 0x21; break;
        case 0x22: value = 0x22; break;
        case 0x23: value = 0x23; break;
        case 0x24: value = 0x24; break;
        case 0x25: value = 0x25; break;
        case 0x26: value = 0x26; break;
        case 0x27: value = 0x27; break;
        case 0x28: value = 0x28; break;
        case 0x29: value = 0x29; break;
        case 0x2A: value = 0x2A; break;
        case 0x2B: value = 0x2B; break;
        case 0x2C: value = 0x2C; break;
        case 0x2D: value = 0x2D; break;
        case 0x2E: value = 0x2E; break;
        case 0x2F: value = 0x2F; break;

        case 0x30: value = 0x30; break;
        case 0x31: value = 0x31; break;
        case 0x32: value = 0x32; break;
        case 0x33: value = 0x33; break;
        case 0x34: value = 0x34; break;
        case 0x35: value = 0x35; break;
        case 0x36: value = 0x36; break;
        case 0x37: value = 0x37; break;
        case 0x38: value = 0x38; break;
        case 0x39: value = 0x39; break;
        case 0x3A: value = 0x3A; break;
        case 0x3B: value = 0x3B; break;
        case 0x3C: value = 0x3C; break;
        case 0x3D: value = 0x3D; break;
        case 0x3E: value = 0x3E; break;
        case 0x3F: value = 0x3F; break;

        case 0x40: value = 0x40; break;
        case 0x41: value = 0x41; break;
        case 0x42: value = 0x42; break;
        case 0x43: value = 0x43; break;
        case 0x44: value = 0x44; break;
        case 0x45: value = 0x45; break;
        case 0x46: value = 0x46; break;
        case 0x47: value = 0x47; break;
        case 0x48: value = 0x48; break;
        case 0x49: value = 0x49; break;
        case 0x4A: value = 0x4A; break;
        case 0x4B: value = 0x4B; break;
        case 0x4C: value = 0x4C; break;
        case 0x4D: value = 0x4D; break;
        case 0x4E: value = 0x4E; break;
        case 0x4F: value = 0x4F; break;

        case 0x50: value = 0x50; break;
        case 0x51: value = 0x51; break;
        case 0x52: value = 0x52; break;
        case 0x53: value = 0x53; break;
        case 0x54: value = 0x54; break;
        case 0x55: value = 0x55; break;
        case 0x56: value = 0x56; break;
        case 0x57: value = 0x57; break;
        case 0x58: value = 0x58; break;
        case 0x59: value = 0x59; break;
        case 0x5A: value = 0x5A; break;
        case 0x5B: value = 0x5B; break;
        case 0x5C: value = 0x5C; break;
        case 0x5D: value = 0x5D; break;
        case 0x5E: value = 0x5E; break;
        case 0x5F: value = 0x5F; break;

        case 0x60: value = 0x60; break;
        case 0x61: value = 0x61; break;
        case 0x62: value = 0x62; break;
        case 0x63: value = 0x63; break;
        case 0x64: value = 0x64; break;
        case 0x65: value = 0x65; break;
        case 0x66: value = 0x66; break;
        case 0x67: value = 0x67; break;
        case 0x68: value = 0x68; break;
        case 0x69: value = 0x69; break;
        case 0x6A: value = 0x6A; break;
        case 0x6B: value = 0x6B; break;
        case 0x6C: value = 0x6C; break;
        case 0x6D: value = 0x6D; break;
        case 0x6E: value = 0x6E; break;
        case 0x6F: value = 0x6F; break;

        case 0x70: value = 0x70; break;
        case 0x71: value = 0x71; break;
        case 0x72: value = 0x72; break;
        case 0x73: value = 0x73; break;
        case 0x74: value = 0x74; break;
        case 0x75: value = 0x75; break;
        case 0x76: value = 0x76; break;
        case 0x77: value = 0x77; break;
        case 0x78: value = 0x78; break;
        case 0x79: value = 0x79; break;
        case 0x7A: value = 0x7A; break;
        case 0x7B: value = 0x7B; break;
        case 0x7C: value = 0x7C; break;
        case 0x7D: value = 0x7D; break;
        case 0x7E: value = 0x7E; break;
        case 0x7F: value = 0x7F; break;

        case 0x80: value = {}; break;
        case 0x81: stack.push(new StackItem(State.ObjectKey, 0x1, {})); continue VALUE;
        case 0x82: stack.push(new StackItem(State.ObjectKey, 0x2, {})); continue VALUE;
        case 0x83: stack.push(new StackItem(State.ObjectKey, 0x3, {})); continue VALUE;
        case 0x84: stack.push(new StackItem(State.ObjectKey, 0x4, {})); continue VALUE;
        case 0x85: stack.push(new StackItem(State.ObjectKey, 0x5, {})); continue VALUE;
        case 0x86: stack.push(new StackItem(State.ObjectKey, 0x6, {})); continue VALUE;
        case 0x87: stack.push(new StackItem(State.ObjectKey, 0x7, {})); continue VALUE;
        case 0x88: stack.push(new StackItem(State.ObjectKey, 0x8, {})); continue VALUE;
        case 0x89: stack.push(new StackItem(State.ObjectKey, 0x9, {})); continue VALUE;
        case 0x8A: stack.push(new StackItem(State.ObjectKey, 0xA, {})); continue VALUE;
        case 0x8B: stack.push(new StackItem(State.ObjectKey, 0xB, {})); continue VALUE;
        case 0x8C: stack.push(new StackItem(State.ObjectKey, 0xC, {})); continue VALUE;
        case 0x8D: stack.push(new StackItem(State.ObjectKey, 0xD, {})); continue VALUE;
        case 0x8E: stack.push(new StackItem(State.ObjectKey, 0xE, {})); continue VALUE;
        case 0x8F: stack.push(new StackItem(State.ObjectKey, 0xF, {})); continue VALUE;

        case 0x90: value = []; break;
        case 0x91: stack.push(new StackItem(State.Array, 0x1, [])); continue VALUE;
        case 0x92: stack.push(new StackItem(State.Array, 0x2, [])); continue VALUE;
        case 0x93: stack.push(new StackItem(State.Array, 0x3, [])); continue VALUE;
        case 0x94: stack.push(new StackItem(State.Array, 0x4, [])); continue VALUE;
        case 0x95: stack.push(new StackItem(State.Array, 0x5, [])); continue VALUE;
        case 0x96: stack.push(new StackItem(State.Array, 0x6, [])); continue VALUE;
        case 0x97: stack.push(new StackItem(State.Array, 0x7, [])); continue VALUE;
        case 0x98: stack.push(new StackItem(State.Array, 0x8, [])); continue VALUE;
        case 0x99: stack.push(new StackItem(State.Array, 0x9, [])); continue VALUE;
        case 0x9A: stack.push(new StackItem(State.Array, 0xA, [])); continue VALUE;
        case 0x9B: stack.push(new StackItem(State.Array, 0xB, [])); continue VALUE;
        case 0x9C: stack.push(new StackItem(State.Array, 0xC, [])); continue VALUE;
        case 0x9D: stack.push(new StackItem(State.Array, 0xD, [])); continue VALUE;
        case 0x9E: stack.push(new StackItem(State.Array, 0xE, [])); continue VALUE;
        case 0x9F: stack.push(new StackItem(State.Array, 0xF, [])); continue VALUE;

        case 0xA0: value = this.str(0); break;
        case 0xA1: value = this.str(1); break;
        case 0xA2: value = this.str(2); break;
        case 0xA3: value = this.str(3); break;
        case 0xA4: value = this.str(4); break;
        case 0xA5: value = this.str(5); break;
        case 0xA6: value = this.str(6); break;
        case 0xA7: value = this.str(7); break;
        case 0xA8: value = this.str(8); break;
        case 0xA9: value = this.str(9); break;
        case 0xAA: value = this.str(10); break;
        case 0xAB: value = this.str(11); break;
        case 0xAC: value = this.str(12); break;
        case 0xAD: value = this.str(13); break;
        case 0xAE: value = this.str(14); break;
        case 0xAF: value = this.str(15); break;

        case 0xB0: value = this.str(16); break;
        case 0xB1: value = this.str(17); break;
        case 0xB2: value = this.str(18); break;
        case 0xB3: value = this.str(19); break;
        case 0xB4: value = this.str(20); break;
        case 0xB5: value = this.str(21); break;
        case 0xB6: value = this.str(22); break;
        case 0xB7: value = this.str(23); break;
        case 0xB8: value = this.str(24); break;
        case 0xB9: value = this.str(25); break;
        case 0xBA: value = this.str(26); break;
        case 0xBB: value = this.str(27); break;
        case 0xBC: value = this.str(28); break;
        case 0xBD: value = this.str(29); break;
        case 0xBE: value = this.str(30); break;
        case 0xBF: value = this.str(31); break;
        
        case 0xC0: value = null; break;
        case 0xC1: value = undefined; break;
        case 0xC2: value = false; break;
        case 0xC3: value = true; break;
        case 0xC4: value = this.bin(this.u8()); break;
        case 0xC5: value = this.bin(this.u16()); break;
        case 0xC6: value = this.bin(this.u32()); break;
        case 0xC7: value = this.ext(this.u8()); break;
        case 0xC8: value = this.ext(this.u16()); break;
        case 0xC9: value = this.ext(this.u32()); break;
        case 0xCA: value = this.f32(); break;
        case 0xCB: value = this.f64(); break;
        case 0xCC: value = this.u8(); break;
        case 0xCD: value = this.u16(); break;
        case 0xCE: value = this.u32(); break;
        case 0xCF: value = this.u32() * 4294967296 + this.u32(); break;

        case 0xD0: value = this.i8(); break;
        case 0xD1: value = this.i16(); break;
        case 0xD2: value = this.i32(); break;
        case 0xD3: value = this.i32() * 4294967296 + this.u32(); break;
        case 0xD4: value = this.ext(1); break;
        case 0xD5: value = this.ext(2); break;
        case 0xD6: value = this.ext(4); break;
        case 0xD7: value = this.ext(8); break;
        case 0xD8: value = this.ext(16); break;
        case 0xD9: value = this.str(this.u8()); break;
        case 0xDA: value = this.str(this.u16()); break;
        case 0xDB: value = this.str(this.u32()); break;
        case 0xDC: stack.push(new StackItem(State.Array, this.u16(), [])); continue VALUE;
        case 0xDD: stack.push(new StackItem(State.Array, this.u32(), [])); continue VALUE;
        case 0xDE: stack.push(new StackItem(State.ObjectKey, this.u16(), {})); continue VALUE;
        case 0xDF: stack.push(new StackItem(State.ObjectKey, this.u32(), {})); continue VALUE;

        case 0xE0: value = -0x20; break;
        case 0xE1: value = -0x1F; break;
        case 0xE2: value = -0x1E; break;
        case 0xE3: value = -0x1D; break;
        case 0xE4: value = -0x1C; break;
        case 0xE5: value = -0x1B; break;
        case 0xE6: value = -0x1A; break;
        case 0xE7: value = -0x19; break;
        case 0xE8: value = -0x18; break;
        case 0xE9: value = -0x17; break;
        case 0xEA: value = -0x16; break;
        case 0xEB: value = -0x15; break;
        case 0xEC: value = -0x14; break;
        case 0xED: value = -0x13; break;
        case 0xEE: value = -0x12; break;
        case 0xEF: value = -0x11; break;

        case 0xF0: value = -0x10; break;
        case 0xF1: value = -0x0F; break;
        case 0xF2: value = -0x0E; break;
        case 0xF3: value = -0x0D; break;
        case 0xF4: value = -0x0C; break;
        case 0xF5: value = -0x0B; break;
        case 0xF6: value = -0x0A; break;
        case 0xF7: value = -0x09; break;
        case 0xF8: value = -0x08; break;
        case 0xF9: value = -0x07; break;
        case 0xFA: value = -0x06; break;
        case 0xFB: value = -0x05; break;
        case 0xFC: value = -0x04; break;
        case 0xFD: value = -0x03; break;
        case 0xFE: value = -0x02; break;
        case 0xFF: value = -0x01; break;
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
