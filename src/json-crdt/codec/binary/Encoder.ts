import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ClockEncoder} from '../../../json-crdt-patch/codec/clock/ClockEncoder';
import {ConstantType} from '../../types/const/ConstantType';
import {CrdtEncoder} from '../../../json-crdt-patch/util/binary/CrdtEncoder';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ITimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {SESSION} from '../../../json-crdt-patch/constants';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {utf8Count} from '../../../util/utf8';
import {ValueType} from '../../types/lww-value/ValueType';
import type {Model} from '../../model';

export class Encoder extends CrdtEncoder {
  protected clockEncoder?: ClockEncoder;
  protected time?: number;
  /** Mapping from literal to position in literal table. */
  protected literals?: Map<unknown, number>;

  public encode(model: Model): Uint8Array {
    delete this.clockEncoder;
    delete this.time;
    this.literals = new Map<string | number, number>();
    this.reset();
    const clock = model.clock;
    const isServerClock = clock.getSessionId() === SESSION.SERVER;
    if (isServerClock) {
      this.time = clock.time;
      this.b1vuint56(true, clock.time);
    } else {
      model.advanceClocks();
      this.clockEncoder = new ClockEncoder(model.clock);
    }
    this.encodeLiteralsTable(model);
    this.encodeRoot(model.root);
    const data = this.flush();
    if (isServerClock) return data;
    this.encodeClockTable(data);
    delete this.clockEncoder;
    delete this.literals;
    return this.flush();
  }
  
  protected encodeLiteralsTable(model: Model) {
    const literalFrequencies = new Map<string | number, number>();
    for (const node of model.nodes.iterate()) {
      if (node instanceof ObjectType) {
        for (const key of node.latest.keys()) {
          const count = literalFrequencies.get(key) || 0;
          literalFrequencies.set(key, count + 1);
        }
      }
    }
    const literals: unknown[] = [];
    for (const [literal, frequency] of literalFrequencies.entries())
      if (frequency > 1) literals.push(literal);
    this.encodeArray(literals);
    for (let i = 0; i < literals.length; i++)
      this.literals!.set(literals[i], i);
  }

  protected encodeClockTable(data: Uint8Array) {
    const clockEncoder = this.clockEncoder!;
    const length = clockEncoder.table.size;
    const dataSize = data.byteLength;
    this.uint8 = new Uint8Array(8 + 12 * length + dataSize);
    this.view = new DataView(this.uint8.buffer, this.uint8.byteOffset, this.uint8.byteLength);
    this.offset = 0;
    this.b1vuint56(false, length);
    for (const sid of clockEncoder.table.keys()) {
      const ts = clockEncoder.clock.clocks.get(sid);
      if (ts) this.uint53vuint39(sid, ts.time);
      else if (sid === clockEncoder.clock.getSessionId()) this.uint53vuint39(sid, 0);
      else {
        // Should never happen.
      }
    }
    this.buf(data, dataSize);
  }

  protected ts(ts: ITimestamp) {
    if (this.clockEncoder) {
      const relativeId = this.clockEncoder!.append(ts);
      this.id(relativeId.sessionIndex, relativeId.timeDiff);
    } else {
      const sessionId = ts.getSessionId();
      if (sessionId === SESSION.SERVER) {
        this.b1vuint56(true, this.time! - ts.time);
      } else {
        this.b1vuint56(false, sessionId);
        this.vuint57(ts.time);
      }
    }
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
    else if (node instanceof BinaryType) return this.encodeBin(node);
    throw new Error('UNKNOWN_NODE');
  }

  protected encodeObj(obj: ObjectType): void {
    const length = obj.latest.size;
    this.encodeObjectHeader(length);
    this.ts(obj.id);
    for (const [key, chunk] of obj.latest.entries()) this.encodeObjChunk(key, chunk);
  }

  protected encodeObjChunk(key: string, chunk: ObjectChunk): void {
    this.ts(chunk.id);
    const length = utf8Count(key);
    const indexInLiteralsTable = this.literals!.get(key);
    if (indexInLiteralsTable !== undefined) {
      this.b1vuint56(true, this.literals!.get(key)!);
    } else {
      this.b1vuint56(false, length);
      this.encodeUtf8(key, length);
    }
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

  protected encodeBin(obj: BinaryType): void {
    const length = obj.size();
    this.encodeBinaryHeader(length);
    this.ts(obj.id);
    for (const chunk of obj.chunks()) this.encodeBinChunk(chunk);
  }

  protected encodeBinChunk(chunk: BinaryChunk): void {
    if (chunk.deleted) {
      this.b1vuint56(true, chunk.deleted);
      this.ts(chunk.id);
    } else {
      const data = chunk.buf!;
      const length = data.byteLength;
      this.b1vuint56(false, length);
      this.ts(chunk.id);
      this.buf(data, length);
    }
  }

  protected encodeConst(obj: ConstantType): void {
    const {value} = obj;
    switch (value) {
      case null:
      case false:
      case true:
        this.encodeAny(value);
        break;
      case undefined:
        this.u8(0xc1);
        break;
      default: {
        if (typeof value === 'number') this.encodeNumber(value);
        else {
          this.u8(0xd4);
          this.encodeAny(value);
        }
      }
    }
  }

  protected encodeVal(obj: ValueType): void {
    this.u8(0xd5);
    this.ts(obj.id);
    this.ts(obj.writeId);
    this.encodeAny(obj.value);
  }

  private encodeUtf8(str: string, byteLength: number): void {
    this.ensureCapacity(byteLength);
    const strLength = str.length;
    const uint8 = this.uint8;
    let offset = this.offset;
    let pos = 0;
    while (pos < strLength) {
      let value = str.charCodeAt(pos++);
      if ((value & 0xffffff80) === 0) {
        uint8[offset++] = value;
        continue;
      } else if ((value & 0xfffff800) === 0) {
        uint8[offset++] = ((value >> 6) & 0x1f) | 0xc0;
      } else {
        if (value >= 0xd800 && value <= 0xdbff) {
          if (pos < strLength) {
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
}
