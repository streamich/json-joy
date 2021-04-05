
export function ensureUint8Array(buffer: ArrayLike<number> | Uint8Array | ArrayBufferView | ArrayBuffer) {
  if (buffer instanceof Uint8Array) {
    return buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer);
  } else {
    // ArrayLike<number>
    return Uint8Array.from(buffer);
  }
}

export function createDataView(buffer: ArrayLike<number> | ArrayBufferView | ArrayBuffer): DataView {
  if (buffer instanceof ArrayBuffer) {
    return new DataView(buffer);
  }

  const bufferView = ensureUint8Array(buffer);
  return new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
}


export function utf8DecodeJs(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
  let offset = inputOffset;
  const end = offset + byteLength;
  const units: Array<number> = [];
  let result = "";
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

const DEFAULT_MAX_KEY_LENGTH = 16;
const DEFAULT_MAX_LENGTH_PER_KEY = 16;

export interface KeyDecoder {
  canBeCached(byteLength: number): boolean;
  decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string;
}

export class CachedKeyDecoder implements KeyDecoder {
  private readonly caches: Array<Array<KeyCacheRecord>>;

  constructor(readonly maxKeyLength = DEFAULT_MAX_KEY_LENGTH, readonly maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
    // avoid `new Array(N)` to create a non-sparse array for performance.
    this.caches = [];
    for (let i = 0; i < this.maxKeyLength; i++) {
      this.caches.push([]);
    }
  }

  public canBeCached(byteLength: number) {
    return byteLength > 0 && byteLength <= this.maxKeyLength;
  }

  private get(bytes: Uint8Array, inputOffset: number, byteLength: number): string | null {
    const records = this.caches[byteLength - 1]!;

    FIND_CHUNK: for (const record of records) {
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
    const record: KeyCacheRecord = { bytes, value };

    if (records.length >= this.maxLengthPerKey) {
      // `records` are full!
      // Set `record` to a randomized position.
      records[(Math.random() * records.length) | 0] = record;
    } else {
      records.push(record);
    }
  }

  public decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
    const cachedValue = this.get(bytes, inputOffset, byteLength);
    if (cachedValue != null) return cachedValue;

    const value = utf8DecodeJs(bytes, inputOffset, byteLength);
    // Ensure to copy a slice of bytes because the byte may be NodeJS Buffer and Buffer#slice() returns a reference to its internal ArrayBuffer.
    const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
    this.store(slicedCopyOfBytes, value);
    return value;
  }
}


export function getInt64(view: DataView, offset: number) {
  const high = view.getInt32(offset);
  const low = view.getUint32(offset + 4);
  return high * 0x1_0000_0000 + low;
}

export function getUint64(view: DataView, offset: number) {
  const high = view.getUint32(offset);
  const low = view.getUint32(offset + 4);
  return high * 0x1_0000_0000 + low;
}


const enum State {
  ARRAY,
  MAP_KEY,
  MAP_VALUE,
}

type MapKeyType = string | number;

const isValidMapKeyType = (key: unknown): key is MapKeyType => {
  const keyType = typeof key;

  return keyType === "string" || keyType === "number";
};

type StackMapState = {
  type: State.MAP_KEY | State.MAP_VALUE;
  size: number;
  key: MapKeyType | null;
  readCount: number;
  map: Record<string, unknown>;
};

type StackArrayState = {
  type: State.ARRAY;
  size: number;
  array: Array<unknown>;
  position: number;
};

type StackState = StackArrayState | StackMapState;

const HEAD_BYTE_REQUIRED = -1;

const EMPTY_VIEW = new DataView(new ArrayBuffer(0));
const EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);

const sharedCachedKeyDecoder = new CachedKeyDecoder();

export class DecodeError extends Error {
  constructor(message: string) {
    super(message);

    // fix the prototype chain in a cross-platform way
    const proto = Object.create(DecodeError.prototype);
    Object.setPrototypeOf(this, proto);

    Object.defineProperty(this, "name", {
      configurable: true,
      enumerable: false,
      value: DecodeError.name,
    });
  }
}

export class Decoder<ContextType> {
  private totalPos = 0;
  private pos = 0;

  private view = EMPTY_VIEW;
  private bytes = EMPTY_BYTES;
  private headByte = HEAD_BYTE_REQUIRED;
  private readonly stack: Array<StackState> = [];

  public constructor(
    private readonly keyDecoder: KeyDecoder | null = sharedCachedKeyDecoder,
  ) {}

  private reinitializeState() {
    this.totalPos = 0;
    this.headByte = HEAD_BYTE_REQUIRED;
  }

  private setBuffer(buffer: ArrayLike<number> | BufferSource): void {
    this.bytes = ensureUint8Array(buffer);
    this.view = createDataView(this.bytes);
    this.pos = 0;
  }

  private appendBuffer(buffer: ArrayLike<number> | BufferSource) {
    if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining()) {
      this.setBuffer(buffer);
    } else {
      // retried because data is insufficient
      const remainingData = this.bytes.subarray(this.pos);
      const newData = ensureUint8Array(buffer);
      const concated = new Uint8Array(remainingData.length + newData.length);
      concated.set(remainingData);
      concated.set(newData, remainingData.length);
      this.setBuffer(concated);
    }
  }

  private hasRemaining(size = 1) {
    return this.view.byteLength - this.pos >= size;
  }

  private createExtraByteError(posToShow: number): Error {
    const { view, pos } = this;
    return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
  }

  public decode(buffer: ArrayLike<number> | BufferSource): unknown {
    this.reinitializeState();
    this.setBuffer(buffer);

    const object = this.doDecodeSync();
    if (this.hasRemaining()) {
      throw this.createExtraByteError(this.pos);
    }
    return object;
  }

  public *decodeMulti(buffer: ArrayLike<number> | BufferSource): Generator<unknown, void, unknown> {
    this.reinitializeState();
    this.setBuffer(buffer);

    while (this.hasRemaining()) {
      yield this.doDecodeSync();
    }
  }

  private doDecodeSync(): unknown {
    DECODE: while (true) {
      const headByte = this.readHeadByte();
      let object: unknown;

      if (headByte >= 0xe0) {
        // negative fixint (111x xxxx) 0xe0 - 0xff
        object = headByte - 0x100;
      } else if (headByte < 0xc0) {
        if (headByte < 0x80) {
          // positive fixint (0xxx xxxx) 0x00 - 0x7f
          object = headByte;
        } else if (headByte < 0x90) {
          // fixmap (1000 xxxx) 0x80 - 0x8f
          const size = headByte - 0x80;
          if (size !== 0) {
            this.pushMapState(size);
            this.complete();
            continue DECODE;
          } else {
            object = {};
          }
        } else if (headByte < 0xa0) {
          // fixarray (1001 xxxx) 0x90 - 0x9f
          const size = headByte - 0x90;
          if (size !== 0) {
            this.pushArrayState(size);
            this.complete();
            continue DECODE;
          } else {
            object = [];
          }
        } else {
          // fixstr (101x xxxx) 0xa0 - 0xbf
          const byteLength = headByte - 0xa0;
          object = this.decodeUtf8String(byteLength, 0);
        }
      } else if (headByte === 0xc0) {
        // nil
        object = null;
      } else if (headByte === 0xc2) {
        // false
        object = false;
      } else if (headByte === 0xc3) {
        // true
        object = true;
      } else if (headByte === 0xca) {
        // float 32
        object = this.readF32();
      } else if (headByte === 0xcb) {
        // float 64
        object = this.readF64();
      } else if (headByte === 0xcc) {
        // uint 8
        object = this.readU8();
      } else if (headByte === 0xcd) {
        // uint 16
        object = this.readU16();
      } else if (headByte === 0xce) {
        // uint 32
        object = this.readU32();
      } else if (headByte === 0xcf) {
        // uint 64
        object = this.readU64();
      } else if (headByte === 0xd0) {
        // int 8
        object = this.readI8();
      } else if (headByte === 0xd1) {
        // int 16
        object = this.readI16();
      } else if (headByte === 0xd2) {
        // int 32
        object = this.readI32();
      } else if (headByte === 0xd3) {
        // int 64
        object = this.readI64();
      } else if (headByte === 0xd9) {
        // str 8
        const byteLength = this.lookU8();
        object = this.decodeUtf8String(byteLength, 1);
      } else if (headByte === 0xda) {
        // str 16
        const byteLength = this.lookU16();
        object = this.decodeUtf8String(byteLength, 2);
      } else if (headByte === 0xdb) {
        // str 32
        const byteLength = this.lookU32();
        object = this.decodeUtf8String(byteLength, 4);
      } else if (headByte === 0xdc) {
        // array 16
        const size = this.readU16();
        if (size !== 0) {
          this.pushArrayState(size);
          this.complete();
          continue DECODE;
        } else {
          object = [];
        }
      } else if (headByte === 0xdd) {
        // array 32
        const size = this.readU32();
        if (size !== 0) {
          this.pushArrayState(size);
          this.complete();
          continue DECODE;
        } else {
          object = [];
        }
      } else if (headByte === 0xde) {
        // map 16
        const size = this.readU16();
        if (size !== 0) {
          this.pushMapState(size);
          this.complete();
          continue DECODE;
        } else {
          object = {};
        }
      } else if (headByte === 0xdf) {
        // map 32
        const size = this.readU32();
        if (size !== 0) {
          this.pushMapState(size);
          this.complete();
          continue DECODE;
        } else {
          object = {};
        }
      } else if (headByte === 0xc4) {
        // bin 8
        const size = this.lookU8();
        object = this.decodeBinary(size, 1);
      } else if (headByte === 0xc5) {
        // bin 16
        const size = this.lookU16();
        object = this.decodeBinary(size, 2);
      } else if (headByte === 0xc6) {
        // bin 32
        const size = this.lookU32();
        object = this.decodeBinary(size, 4);
      } else if (headByte === 0xd4) {
        // fixext 1
        object = this.decodeExtension(1, 0);
      } else if (headByte === 0xd5) {
        // fixext 2
        object = this.decodeExtension(2, 0);
      } else if (headByte === 0xd6) {
        // fixext 4
        object = this.decodeExtension(4, 0);
      } else if (headByte === 0xd7) {
        // fixext 8
        object = this.decodeExtension(8, 0);
      } else if (headByte === 0xd8) {
        // fixext 16
        object = this.decodeExtension(16, 0);
      } else if (headByte === 0xc7) {
        // ext 8
        const size = this.lookU8();
        object = this.decodeExtension(size, 1);
      } else if (headByte === 0xc8) {
        // ext 16
        const size = this.lookU16();
        object = this.decodeExtension(size, 2);
      } else if (headByte === 0xc9) {
        // ext 32
        const size = this.lookU32();
        object = this.decodeExtension(size, 4);
      } else {
        throw new DecodeError(`Unrecognized type byte`);
      }

      this.complete();

      const stack = this.stack;
      while (stack.length > 0) {
        // arrays and maps
        const state = stack[stack.length - 1]!;
        if (state.type === State.ARRAY) {
          state.array[state.position] = object;
          state.position++;
          if (state.position === state.size) {
            stack.pop();
            object = state.array;
          } else {
            continue DECODE;
          }
        } else if (state.type === State.MAP_KEY) {
          if (!isValidMapKeyType(object)) {
            throw new DecodeError("The type of key must be string or number but " + typeof object);
          }
          if (object === "__proto__") {
            throw new DecodeError("The key __proto__ is not allowed");
          }

          state.key = object;
          state.type = State.MAP_VALUE;
          continue DECODE;
        } else {
          // it must be `state.type === State.MAP_VALUE` here

          state.map[state.key!] = object;
          state.readCount++;

          if (state.readCount === state.size) {
            stack.pop();
            object = state.map;
          } else {
            state.key = null;
            state.type = State.MAP_KEY;
            continue DECODE;
          }
        }
      }

      return object;
    }
  }

  private readHeadByte(): number {
    if (this.headByte === HEAD_BYTE_REQUIRED) {
      this.headByte = this.readU8();
      // console.log("headByte", prettyByte(this.headByte));
    }

    return this.headByte;
  }

  private complete(): void {
    this.headByte = HEAD_BYTE_REQUIRED;
  }

  private readArraySize(): number {
    const headByte = this.readHeadByte();

    switch (headByte) {
      case 0xdc:
        return this.readU16();
      case 0xdd:
        return this.readU32();
      default: {
        if (headByte < 0xa0) {
          return headByte - 0x90;
        } else {
          throw new DecodeError(`Unrecognized array type byte`);
        }
      }
    }
  }

  private pushMapState(size: number) {
    this.stack.push({
      type: State.MAP_KEY,
      size,
      key: null,
      readCount: 0,
      map: {},
    });
  }

  private pushArrayState(size: number) {
    this.stack.push({
      type: State.ARRAY,
      size,
      array: new Array<unknown>(size),
      position: 0,
    });
  }

  private decodeUtf8String(byteLength: number, headerOffset: number): string {
    const offset = this.pos + headerOffset;
    let object: string;
    if (this.stateIsMapKey() && this.keyDecoder?.canBeCached(byteLength)) {
      object = this.keyDecoder.decode(this.bytes, offset, byteLength);
    } else {
      object = utf8DecodeJs(this.bytes, offset, byteLength);
    }
    this.pos += headerOffset + byteLength;
    return object;
  }

  private stateIsMapKey(): boolean {
    if (this.stack.length > 0) {
      const state = this.stack[this.stack.length - 1]!;
      return state.type === State.MAP_KEY;
    }
    return false;
  }

  private decodeBinary(byteLength: number, headOffset: number): Uint8Array {
    const offset = this.pos + headOffset;
    const object = this.bytes.subarray(offset, offset + byteLength);
    this.pos += headOffset + byteLength;
    return object;
  }

  private decodeExtension(size: number, headOffset: number): unknown {
    const extType = this.view.getInt8(this.pos + headOffset);
    const data = this.decodeBinary(size, headOffset + 1 /* extType */);
    // return this.extensionCodec.decode(data, extType, this.context);
    throw new Error('extension not implemented');
  }

  private lookU8() {
    return this.view.getUint8(this.pos);
  }

  private lookU16() {
    return this.view.getUint16(this.pos);
  }

  private lookU32() {
    return this.view.getUint32(this.pos);
  }

  private readU8(): number {
    const value = this.view.getUint8(this.pos);
    this.pos++;
    return value;
  }

  private readI8(): number {
    const value = this.view.getInt8(this.pos);
    this.pos++;
    return value;
  }

  private readU16(): number {
    const value = this.view.getUint16(this.pos);
    this.pos += 2;
    return value;
  }

  private readI16(): number {
    const value = this.view.getInt16(this.pos);
    this.pos += 2;
    return value;
  }

  private readU32(): number {
    const value = this.view.getUint32(this.pos);
    this.pos += 4;
    return value;
  }

  private readI32(): number {
    const value = this.view.getInt32(this.pos);
    this.pos += 4;
    return value;
  }

  private readU64(): number {
    const value = getUint64(this.view, this.pos);
    this.pos += 8;
    return value;
  }

  private readI64(): number {
    const value = getInt64(this.view, this.pos);
    this.pos += 8;
    return value;
  }

  private readF32() {
    const value = this.view.getFloat32(this.pos);
    this.pos += 4;
    return value;
  }

  private readF64() {
    const value = this.view.getFloat64(this.pos);
    this.pos += 8;
    return value;
  }
}
