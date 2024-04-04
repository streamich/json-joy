import type {IWriter, IWriterGrowable} from '../../util/buffers';
import type {BinaryJsonEncoder} from '../types';

export class BencodeEncoder implements BinaryJsonEncoder {
  constructor(public readonly writer: IWriter & IWriterGrowable) {}

  public encode(value: unknown): Uint8Array {
    const writer = this.writer;
    writer.reset();
    this.writeAny(value);
    return writer.flush();
  }

  /**
   * Called when the encoder encounters a value that it does not know how to encode.
   *
   * @param value Some JavaScript value.
   */
  public writeUnknown(value: unknown): void {
    this.writeNull();
  }

  public writeAny(value: unknown): void {
    switch (typeof value) {
      case 'boolean':
        return this.writeBoolean(value);
      case 'number':
        return this.writeNumber(value as number);
      case 'string':
        return this.writeStr(value);
      case 'object': {
        if (value === null) return this.writeNull();
        const constructor = value.constructor;
        switch (constructor) {
          case Object:
            return this.writeObj(value as Record<string, unknown>);
          case Array:
            return this.writeArr(value as unknown[]);
          case Uint8Array:
            return this.writeBin(value as Uint8Array);
          default:
            return this.writeUnknown(value);
        }
      }
      case 'undefined': {
        return this.writeUndef();
      }
      default:
        return this.writeUnknown(value);
    }
  }

  public writeNull(): void {
    throw new Error('Method not implemented.');
  }

  public writeUndef(): void {
    throw new Error('Method not implemented.');
  }

  public writeBoolean(bool: boolean): void {
    throw new Error('Method not implemented.');
  }

  public writeNumber(num: number): void {
    const writer = this.writer;
    writer.u8(0x69); // 'i'
    writer.ascii(Math.round(num) + '');
    writer.u8(0x65); // 'e'
  }

  public writeInteger(int: number): void {
    const writer = this.writer;
    writer.u8(0x69); // 'i'
    writer.ascii(int + '');
    writer.u8(0x65); // 'e'
  }

  public writeUInteger(uint: number): void {
    this.writeInteger(uint);
  }

  public writeFloat(float: number): void {
    this.writeNumber(float);
  }

  public writeBin(buf: Uint8Array): void {
    throw new Error('Method not implemented.');
  }

  public writeStr(str: string): void {
    throw new Error('Method not implemented.');
  }

  public writeAsciiStr(str: string): void {
    throw new Error('Method not implemented.');
  }

  public writeArr(arr: unknown[]): void {
    throw new Error('Method not implemented.');
  }

  public writeObj(obj: Record<string, unknown>): void {
    throw new Error('Method not implemented.');
  }
}
