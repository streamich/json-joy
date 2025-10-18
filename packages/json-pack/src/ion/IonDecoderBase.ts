import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import sharedCachedUtf8Decoder from '@jsonjoy.com/buffers/lib/utf8/sharedCachedUtf8Decoder';
import type {CachedUtf8Decoder} from '@jsonjoy.com/buffers/lib/utf8/CachedUtf8Decoder';
import type {IReader, IReaderResettable} from '@jsonjoy.com/buffers/lib';
import {TYPE} from './constants';
import {Import} from './Import';

export class IonDecoderBase<R extends IReader & IReaderResettable = IReader & IReaderResettable> {
  public readonly reader: R;
  public readonly utf8Decoder: CachedUtf8Decoder;
  protected symbols?: Import;

  constructor(reader?: R) {
    this.reader = (reader ?? new Reader()) as R;
    this.utf8Decoder = sharedCachedUtf8Decoder;
  }

  public val(): unknown {
    const typedesc = this.reader.u8();
    const type = (typedesc >> 4) & 0xf;
    const length = typedesc & 0xf;

    switch (type) {
      case TYPE.NULL:
        return this.readNull(length);
      case TYPE.BOOL:
        return this.readBool(length);
      case TYPE.UINT:
        return this.readUint(length);
      case TYPE.NINT:
        return this.readNint(length);
      case TYPE.FLOT:
        return this.readFloat(length);
      case TYPE.STRI:
        return this.readString(length);
      case TYPE.BINA:
        return this.readBinary(length);
      case TYPE.LIST:
        return this.readList(length);
      case TYPE.STRU:
        return this.readStruct(length);
      case TYPE.ANNO:
        return this.readAnnotation(length);
      default:
        throw new Error(`Unknown Ion type: 0x${type.toString(16)}`);
    }
  }

  protected readNull(length: number): null {
    if (length === 15) return null;
    if (length === 0) {
      // NOP padding - skip bytes
      this.val(); // Read and discard next value
      return null;
    }
    if (length === 14) {
      // Extended length NOP padding
      const padLength = this.readVUint();
      this.reader.x += padLength;
      this.val(); // Read and discard next value
      return null;
    }
    // Regular NOP padding
    this.reader.x += length;
    this.val(); // Read and discard next value
    return null;
  }

  protected readBool(length: number): boolean | null {
    if (length === 15) return null;
    if (length === 0) return false;
    if (length === 1) return true;
    throw new Error(`Invalid bool length: ${length}`);
  }

  protected readUint(length: number): number | null {
    if (length === 15) return null;
    if (length === 0) return 0;

    let value = 0;
    for (let i = 0; i < length; i++) {
      value = value * 256 + this.reader.u8();
    }
    return value;
  }

  protected readNint(length: number): number | null {
    if (length === 15) return null;
    if (length === 0) throw new Error('Negative zero is illegal');

    let value = 0;
    for (let i = 0; i < length; i++) {
      value = value * 256 + this.reader.u8();
    }
    return -value;
  }

  protected readFloat(length: number): number | null {
    if (length === 15) return null;
    if (length === 0) return 0.0;
    if (length === 4) return this.reader.f32();
    if (length === 8) return this.reader.f64();
    throw new Error(`Unsupported float length: ${length}`);
  }

  protected readString(length: number): string | null {
    if (length === 15) return null;

    let actualLength = length;
    if (length === 14) {
      actualLength = this.readVUint();
    }

    if (actualLength === 0) return '';

    return this.reader.utf8(actualLength);
  }

  protected readBinary(length: number): Uint8Array | null {
    if (length === 15) return null;

    let actualLength = length;
    if (length === 14) {
      actualLength = this.readVUint();
    }

    if (actualLength === 0) return new Uint8Array(0);

    return this.reader.buf(actualLength);
  }

  protected readList(length: number): unknown[] | null {
    if (length === 15) return null;

    let actualLength = length;
    if (length === 14) {
      actualLength = this.readVUint();
    }

    if (actualLength === 0) return [];

    const endPos = this.reader.x + actualLength;
    const list: unknown[] = [];

    while (this.reader.x < endPos) {
      list.push(this.val());
    }

    if (this.reader.x !== endPos) {
      throw new Error('List parsing error: incorrect length');
    }

    return list;
  }

  protected readStruct(length: number): Record<string, unknown> | null {
    if (length === 15) return null;

    let actualLength = length;
    if (length === 14) {
      actualLength = this.readVUint();
    }

    if (actualLength === 0) return {};

    const endPos = this.reader.x + actualLength;
    const struct: Record<string, unknown> = {};

    while (this.reader.x < endPos) {
      const fieldNameId = this.readVUint();
      const fieldName = this.getSymbolText(fieldNameId);
      const fieldValue = this.val();
      struct[fieldName] = fieldValue;
    }

    if (this.reader.x !== endPos) {
      throw new Error('Struct parsing error: incorrect length');
    }

    return struct;
  }

  protected readAnnotation(length: number): unknown {
    if (length < 3) {
      throw new Error('Annotation wrapper must have at least 3 bytes');
    }

    let _actualLength = length;
    if (length === 14) {
      _actualLength = this.readVUint();
    }

    const annotLength = this.readVUint();
    const endAnnotPos = this.reader.x + annotLength;

    // Skip annotations for now - just read and ignore them
    while (this.reader.x < endAnnotPos) {
      this.readVUint(); // Skip annotation symbol ID
    }

    if (this.reader.x !== endAnnotPos) {
      throw new Error('Annotation parsing error: incorrect annotation length');
    }

    // Return the actual value, ignoring annotations
    return this.val();
  }

  protected readVUint(): number {
    let value = 0;
    let byte: number;

    do {
      byte = this.reader.u8();
      value = (value << 7) | (byte & 0x7f);
    } while ((byte & 0x80) === 0);

    return value;
  }

  protected readVInt(): number {
    const firstByte = this.reader.u8();

    // Single byte case
    if (firstByte & 0x80) {
      const sign = firstByte & 0x40 ? -1 : 1;
      const magnitude = firstByte & 0x3f;
      return sign * magnitude;
    }

    // Multi-byte case
    const sign = firstByte & 0x40 ? -1 : 1;
    let magnitude = firstByte & 0x3f;
    let byte: number;

    do {
      byte = this.reader.u8();
      magnitude = (magnitude << 7) | (byte & 0x7f);
    } while ((byte & 0x80) === 0);

    return sign * magnitude;
  }

  protected getSymbolText(symbolId: number): string {
    if (!this.symbols) {
      throw new Error('No symbol table available');
    }

    const symbol = this.symbols.getText(symbolId);
    if (symbol === undefined) {
      throw new Error(`Unknown symbol ID: ${symbolId}`);
    }

    return symbol;
  }

  protected validateBVM(): void {
    const bvm = this.reader.u32();
    if (bvm !== 0xe00100ea) {
      throw new Error(`Invalid Ion Binary Version Marker: 0x${bvm.toString(16)}`);
    }
  }

  protected readSymbolTable(): void {
    // Check if there's enough data and if the next byte indicates an annotation
    if (this.reader.x < this.reader.uint8.length) {
      const nextByte = this.reader.peak();
      const type = (nextByte >> 4) & 0xf;

      if (type === TYPE.ANNO) {
        // This might be a symbol table annotation
        const annotValue = this.val();

        // The annotated value should be a struct with a 'symbols' field
        if (annotValue && typeof annotValue === 'object' && !Array.isArray(annotValue)) {
          const symbolsKey = 'symbols'; // This is what symbol ID 7 maps to
          const obj = annotValue as Record<string, unknown>;

          if (symbolsKey in obj && Array.isArray(obj[symbolsKey])) {
            // Update the symbol table with new symbols
            const newSymbols = obj[symbolsKey] as string[];
            this.symbols = new Import(this.symbols || null, newSymbols);
          }
        }
      }
    }
  }
}
