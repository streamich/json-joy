import {isFloat32} from '../../util/buffers/isFloat32';
import {CborEncoderFast} from './CborEncoderFast';
import {MAJOR_OVERLAY} from './constants';

const isSafeInteger = Number.isSafeInteger;

export class CborEncoder extends CborEncoderFast {
  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'number':
        return this.writeNumber(value as number);
      case 'string':
        return this.writeStr(value);
      case 'boolean':
        return this.writer.u8(0xf4 + +value);
      case 'object': {
        if (!value) return this.writer.u8(0xf6);
        const constructor = value.constructor;
        switch (constructor) {
          case Array:
            return this.writeArr(value as unknown[]);
          case Uint8Array:
            return this.writeBin(value as Uint8Array);
          case Map:
            return this.writeMap(value as Map<unknown, unknown>);
          default:
            return this.writeObj(value as Record<string, unknown>);
        }
      }
      case 'undefined':
        return this.writer.u8(0xf7);
      case 'bigint':
        return this.writeBigInt(value as bigint);
    }
  }

  public writeNumber(num: number): void {
    if (isSafeInteger(num)) this.writeInteger(num);
    else if (typeof num === 'bigint') this.writeBigInt(num);
    else this.writeFloat(num);
  }

  public writeBigInt(int: bigint): void {
    if (int >= 0) this.writeBigUint(int);
    else this.writeBigSint(int);
  }

  public writeBigUint(uint: bigint): void {
    switch (true) {
      case uint <= 23:
        this.writer.u8(MAJOR_OVERLAY.UIN + Number(uint));
        break;
      case uint <= 0xff:
        this.writer.u16((0x18 << 8) + Number(uint));
        break;
      case uint <= 0xffff:
        this.writer.u8u16(0x19, Number(uint));
        break;
      case uint <= 0xffffffff:
        this.writer.u8u32(0x1a, Number(uint));
        break;
      default: {
        this.writer.u8u64(0x1b, uint);
        break;
      }
    }
  }

  public writeBigSint(int: bigint): void {
    const uint = -BigInt(1) - int;
    switch (true) {
      case uint <= 24:
        this.writer.u8(MAJOR_OVERLAY.NIN + Number(uint));
        break;
      case uint <= 0xff:
        this.writer.u16((0x38 << 8) + Number(uint));
        break;
      case uint <= 0xffff:
        this.writer.u8u16(0x39, Number(uint));
        break;
      case uint <= 0xffffffff:
        this.writer.u8u32(0x3a, Number(uint));
        break;
      default:
        this.writer.u8u64(0x3b, uint);
        break;
    }
  }

  public writeFloat(float: number): void {
    if (isFloat32(float)) this.writer.u8f32(0xfa, float);
    else this.writer.u8f64(0xfb, float);
  }

  public writeMap(map: Map<unknown, unknown>): void {
    this.writeMapHdr(map.size);
    map.forEach((value, key) => {
      this.writeAny(key);
      this.writeAny(value);
    });
  }
}
