import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {ClockEncoder} from '../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Encoder as JsonPackEncoder} from '../../../json-pack/Encoder';
import {utf8Count} from '../../../util/utf8';
import {Document} from '../../document';
import {JsonNode} from '../../types';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ValueType} from '../../types/lww-value/ValueType';
import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';

export class Encoder extends JsonPackEncoder {
  protected clockEncoder!: ClockEncoder;

  public encode(doc: Document): Uint8Array {
    this.reset();
    this.clockEncoder = new ClockEncoder(doc.clock);
    this.encodeRoot(doc.root);
    const data = this.flush();
    this.encodeClockTable(data);
    return this.flush();
  }

  protected encodeClockTable(data: Uint8Array) {
    const {clockEncoder} = this;
    const length = clockEncoder.table.size;
    const dataSize = data.byteLength;
    this.uint8 = new Uint8Array(8 + (12 * length) + dataSize);
    this.view = new DataView(this.uint8.buffer);
    this.offset = 0;
    this.b1vuint56(false, length);
    for (const {sessionId, time} of clockEncoder.clocks()) this.clock(sessionId, time);
    this.buf(data, dataSize);
  }

  protected ts(ts: LogicalTimestamp) {
    const id = this.clockEncoder.append(ts);
    this.id(id.sessionIndex, id.timeDiff);
  }

  protected encodeRoot(root: DocRootType): void {
    this.ts(root.id);
    if (root.node) this.encodeNode(root.node);
  }

  protected encodeNode(node: JsonNode): void {
    if (node instanceof ObjectType) return this.encodeObj(node);
    else if (node instanceof ArrayType) return this.encodeArr(node);
    else if (node instanceof StringType) return this.encodeStr(node);
    else if (node instanceof ValueType) return this.encodeVal(node);
    else if (node instanceof ConstantType) return this.encodeConst(node);
    throw new Error('UNKNOWN_NODE');
  }

  protected encodeObj(obj: ObjectType): void {
    const length = obj.latest.size;
    this.encodeObjectHeader(length);
    this.ts(obj.id);
    for (const [key, chunk] of obj.latest.entries())
      this.encodeObjChunk(key, chunk);
  }

  protected encodeObjChunk(key: string, chunk: ObjectChunk): void {
    this.ts(chunk.id);
    const length = utf8Count(key);
    this.vuint57(length);
    this.encodeUtf8(key, length);
    this.encodeNode(chunk.node);
  }

  protected encodeArr(obj: ArrayType): void {
    const length = obj.size();
    this.encodeArrayHeader(length);
    this.ts(obj.id);
    for (const chunk of obj.chunks()) this.encodeArrChunk(chunk);
  }

  protected encodeArrChunk(chunk: ArrayChunk): void {
    if (chunk.deleted) {
      this.b1vuint56(true, chunk.deleted);
      this.ts(chunk.id);
    } else {
      const nodes = chunk.nodes!;
      const length = nodes.length;
      this.b1vuint56(false, length);
      this.ts(chunk.id);
      for (let i = 0; i < length; i++) this.encodeNode(nodes[i]);
    }
  }

  protected encodeStr(obj: StringType): void {
    const length = obj.size();
    this.encodeStringHeader(length);
    this.ts(obj.id);
    for (const chunk of obj.chunks()) this.encodeStrChunk(chunk);
  }

  protected encodeStrChunk(chunk: StringChunk): void {
    if (chunk.deleted) {
      this.b1vuint56(true, chunk.deleted);
      this.ts(chunk.id);
    } else {
      const text = chunk.str!;
      const length = utf8Count(text);
      this.b1vuint56(false, length);
      this.ts(chunk.id);
      this.encodeUtf8(text, length);
    }
  }

  protected encodeConst(obj: ConstantType): void {
    const {value} = obj;
    switch (value) {
      case null:
      case undefined:
      case false:
      case true:
        this.encodeAny(value);
        break;
      default: {
        if (typeof value === 'number') this.encodeNumber(value);
        else {
          this.u8(0xD4);
          this.encodeAny(value);
        }
      }
    }
  }

  protected encodeVal(obj: ValueType): void {
    this.u8(0xD5);
    this.ts(obj.id);
    this.ts(obj.writeId);
    this.encodeAny(obj.value);
  }

  private encodeUtf8(str: string, byteLength: number): void {
    this.ensureCapacity(byteLength);
    const uint8 = this.uint8;
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
              pos++;
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
  }

  /**
   * Encoding schema:
   * 
   * ```
   * byte 1                                                         byte 8                              byte 12
   * +--------+--------+--------+--------+--------+--------+-----|---+--------+........+........+........+········+
   * |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|?zz|zzzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
   * +--------+--------+--------+--------+--------+--------+-----^---+--------+........+........+........+········+
   * 
   *  33322222 22222111 1111111           44444444 43333333 55554 .1           .1111111 .2222211 .3322222 33333333
   *  21098765 43210987 65432109 87654321 87654321 09876543 32109 .09 87654321 .7654321 .4321098 .1098765 98765432
   *  |                                     |               |      |                       |
   *  |                                     |               |      10th bit of z           |
   *  |                                     46th bit of x   |                              |
   *  |                                                     |                              22nd bit of z
   *  |                                                     53rd bit of x
   *  32nd bit of x
   * ```
   */
  public clock(x: number, z: number): void {
    let x1 = x | 0;
    if (x1 < 0) x1 += 4294967296;
    const x2 = (x - x1) / 4294967296;
    this.u32(x1);
    this.u16(x2 & 0xFFFF);
    const fiveXBits = (x2 >>> 16) << 3;
    const twoZBits = (z >>> 8) & 0b11;
    const zFitsIn10Bits = z <= 0b11_11111111;
    this.u8(fiveXBits | (zFitsIn10Bits ? 0b000 : 0b100) | twoZBits);
    this.u8(z & 0xFF);
    if (zFitsIn10Bits) return;
    if (z <= 0b1111111_11_11111111) {
      this.u8(z >>> 10);
    } else if (z <= 0b1111111_1111111_11_11111111) {
      this.u8(0b1_0000000 | ((z >>> 10) & 0b0_1111111));
      this.u8(z >>> 17);
    } else if (z <= 0b1111111_1111111_1111111_11_11111111) {
      this.u8(0b1_0000000 | ((z >>> 10) & 0b0_1111111));
      this.u8(0b1_0000000 | ((z >>> 17) & 0b0_1111111));
      this.u8(z >>> 24);
    } else {
      let z1 = z | 0;
      if (z1 < 0) z1 += 4294967296;
      const z2 = (z - z1) / 4294967296;
      this.u8(0b1_0000000 | ((z1 >>> 10) & 0b0_1111111));
      this.u8(0b1_0000000 | ((z1 >>> 17) & 0b0_1111111));
      this.u8(0b1_0000000 | ((z1 >>> 24) & 0b0_1111111));
      this.u8((z1 >>> 31) | (z2 << 1));
    }
  }

  /**
   * In the below encoding diagrams bits are annotated as follows:
   * 
   * - "x" - vector table index, reference to the logical clock.
   * - "y" - time difference.
   * - "?" - whether the next byte is used for encoding.
   * 
   * If x is less than 8 and y is less than 16, the relative ID is encoded as a
   * single byte:
   * 
   * ```
   * +--------+
   * |0xxxyyyy|
   * +--------+
   * ```
   * 
   * Otherwise the top bit of the first byte is set to 1; and x and y are encoded
   * separately using b1vuint28 and vuint39, respectively.
   * 
   * ```
   *       x          y
   * +===========+=========+
   * | b1vuint28 | vuint39 |
   * +===========+=========+
   * ```
   * 
   * The boolean flag of x b1vuint28 value is always set to 1.
   */
  public id(x: number, y: number): void {
    if ((x <= 0b111) && (y <= 0b1111)) {
      this.u8((x << 4) | y);
    } else {
      this.b1vuint28(true, x);
      this.vuint39(y);
    }
  }

  /**
   * #### `vuint57` (variable length unsigned 57 bit integer)
   * 
   * Variable length unsigned 57 bit integer is encoded using up to 8 bytes. The maximum
   * size of the decoded value is 57 bits of data.
   * 
   * The high bit "?" of each byte indicates if the next byte should be consumed, up
   * to 8 bytes.
   * 
   * ```
   * byte 1                                                         byte 8
   * +--------+........+........+........+........+........+........+········+
   * |?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
   * +--------+........+........+........+........+........+........+········+
   * 
   *            11111    2211111  2222222  3333332  4443333  4444444 55555555
   *   7654321  4321098  1098765  8765432  5432109  2109876  9876543 76543210
   *     |                        |                    |             |
   *     5th bit of z             |                    |             |
   *                              28th bit of z        |             57th bit of z
   *                                                   39th bit of z
   * ```
   * 
   * @param num Number to encode as vuint57
   */
  public vuint57(num: number) {
    if (num <= 0b1111111) {
      this.u8(num);
    } else if (num <= 0b1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(num >>> 7);
    } else if (num <= 0b1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(num >>> 14);
    } else if (num <= 0b1111111_1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
      this.u8(num >>> 21);
    } else {
      let lo32 = num | 0;
      if (lo32 < 0) lo32 += 4294967296;
      const hi32 = (num - lo32) / 4294967296;
      if (num <= 0b1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8((hi32 << 4) | (num >>> 28));
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8(hi32 >>> 3);
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8(0b10000000 | ((hi32 & 0b1111111_000) >>> 3));
        this.u8(hi32 >>> 10);
      } else {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8(0b10000000 | ((hi32 & 0b1111111_000) >>> 3));
        this.u8(0b10000000 | ((hi32 & 0b1111111_0000000_000) >>> 10));
        this.u8(hi32 >>> 17);
      }
    }
  }

  public vuint39(num: number) {
    if (num <= 0b1111111) {
      this.u8(num);
    } else if (num <= 0b1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(num >>> 7);
    } else if (num <= 0b1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(num >>> 14);
    } else if (num <= 0b1111111_1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
      this.u8(num >>> 21);
    } else {
      let lo32 = num | 0;
      if (lo32 < 0) lo32 += 4294967296;
      const hi32 = (num - lo32) / 4294967296;
      if (num <= 0b1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8((hi32 << 4) | (num >>> 28));
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8((hi32 >>> 3) & 0b1111);
      }
    }
  }

  public b1vuint56(flag: boolean, num: number) {
    if (num <= 0b111111) {
      this.u8((flag ? 0b10000000 : 0b00000000) | num);
    } else {
      const firstByteMask = flag ? 0b11000000 : 0b01000000;
      if (num <= 0b1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(num >>> 6);
      } else if (num <= 0b1111111_1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(num >>> 13);
      } else if (num <= 0b1111111_1111111_1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
        this.u8(num >>> 20);
      } else {
        let lo32 = num | 0;
        if (lo32 < 0) lo32 += 4294967296;
        const hi32 = (num - lo32) / 4294967296;
        if (num <= 0b1111111_1111111_1111111_1111111_111111) {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8((hi32 << 5) | (num >>> 27));
        } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_111111) {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8(0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27));
          this.u8(hi32 >>> 2);
        } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111_111111) {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8(0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27));
          this.u8(0b10000000 | ((hi32 & 0b1111111_00) >>> 2));
          this.u8(hi32 >>> 9);
        } else {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8(0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27));
          this.u8(0b10000000 | ((hi32 & 0b1111111_00) >>> 2));
          this.u8(0b10000000 | ((hi32 & 0b1111111_0000000_00) >>> 9));
          this.u8(hi32 >>> 16);
        }
      }
    }
  }

  public b1vuint28(flag: boolean, num: number) {
    if (num <= 0b111111) {
      this.u8((flag ? 0b10000000 : 0b00000000) | num);
    } else {
      const firstByteMask = flag ? 0b11000000 : 0b01000000;
      if (num <= 0b1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(num >>> 6);
      } else if (num <= 0b1111111_1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(num >>> 13);
      } else {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
        this.u8(num >>> 20);
      }
    }
  }
}
