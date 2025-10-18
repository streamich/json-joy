import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {
  AnnotationAstNode,
  ArrAstNode,
  type AstNode,
  BinAstNode,
  BoolAstNode,
  FloatAstNode,
  NintAstNode,
  NullAstNode,
  ObjAstNode,
  StrAstNode,
  toAst,
  UintAstNode,
} from './ast';
import {TYPE_OVERLAY} from './constants';
import {Import} from './Import';
import {systemSymbolImport} from './symbols';

export class IonEncoderFast {
  protected symbols?: Import;

  constructor(public readonly writer: IWriter & IWriterGrowable = new Writer()) {}

  public encode(value: unknown): Uint8Array {
    this.writer.reset();
    this.symbols = new Import(systemSymbolImport, []);
    const ast = toAst(value, this.symbols);
    this.writeIvm();
    this.writeSymbolTable();
    this.writeAny(ast);
    return this.writer.flush();
  }

  public writeAny(value: AstNode<unknown>): void {
    if (value instanceof NullAstNode) this.writer.u8(TYPE_OVERLAY.NULL + 15);
    else if (value instanceof StrAstNode) this.writeStr(value);
    else if (value instanceof UintAstNode) this.encodeUint(value);
    else if (value instanceof NintAstNode) this.encodeNint(value);
    else if (value instanceof ObjAstNode) this.writeObj(value);
    else if (value instanceof ArrAstNode) this.writeArr(value);
    else if (value instanceof FloatAstNode) this.writeFloat(value);
    else if (value instanceof BoolAstNode) this.writeBool(value);
    else if (value instanceof BinAstNode) this.writeBin(value);
  }

  public writeIvm(): void {
    this.writer.u32(0xe00100ea);
  }

  public writeSymbolTable(): void {
    if (!this.symbols?.length) return;
    const node = new AnnotationAstNode(this.symbols!.toAst(), [3]);
    this.writeAnnotations(node);
  }

  public writeAnnotations(node: AnnotationAstNode): void {
    const writer = this.writer;
    if (node.len < 14) writer.u8(TYPE_OVERLAY.ANNO + node.len);
    else {
      writer.u8(TYPE_OVERLAY.ANNO + 14);
      this.writeVUint(node.len);
    }
    this.writeVUint(node.annotationLen);
    for (let i = 0; i < node.annotations.length; i++) this.writeVUint(node.annotations[i]);
    this.writeAny(node.val);
  }

  public writeBool(node: BoolAstNode): void {
    this.writer.u8(TYPE_OVERLAY.BOOL + (node.val ? 1 : 0));
  }

  public encodeUint(node: UintAstNode): void {
    const uint = node.val;
    if (!uint) this.writer.u8(TYPE_OVERLAY.UINT);
    else if (uint <= 0xff) this.writer.u16(((TYPE_OVERLAY.UINT + 1) << 8) + uint);
    else if (uint <= 0xffff) this.writer.u8u16(TYPE_OVERLAY.UINT + 2, uint);
    else if (uint <= 0xffffff) this.writer.u32(((TYPE_OVERLAY.UINT + 3) << 24) + uint);
    else if (uint <= 0xffffffff) this.writer.u8u32(TYPE_OVERLAY.UINT + 4, uint);
    else {
      let lo = uint | 0;
      if (lo < 0) lo += 4294967296;
      let hi = uint - lo;
      hi /= 4294967296;
      if (uint <= 0xffffffffff) {
        this.writer.u16(((TYPE_OVERLAY.UINT + 5) << 8) + hi);
        this.writer.u32(lo);
      } else if (uint <= 0xffffffffffff) {
        this.writer.u8u16(TYPE_OVERLAY.UINT + 6, hi);
        this.writer.u32(lo);
      } else {
        this.writer.u16(((TYPE_OVERLAY.UINT + 7) << 8) + (hi >> 16));
        this.writer.u16(hi & 0xffff);
        this.writer.u32(lo);
      }
    }
  }

  public encodeNint(node: NintAstNode): void {
    const uint = -node.val;
    if (uint <= 0xff) this.writer.u16(((TYPE_OVERLAY.NINT + 1) << 8) + uint);
    else if (uint <= 0xffff) this.writer.u8u16(TYPE_OVERLAY.NINT + 2, uint);
    else if (uint <= 0xffffff) this.writer.u32(((TYPE_OVERLAY.NINT + 3) << 24) + uint);
    else if (uint <= 0xffffffff) this.writer.u8u32(TYPE_OVERLAY.NINT + 4, uint);
    else {
      let lo = uint | 0;
      if (lo < 0) lo += 4294967296;
      let hi = uint - lo;
      hi /= 4294967296;
      if (uint <= 0xffffffffff) {
        this.writer.u16(((TYPE_OVERLAY.NINT + 5) << 8) + hi);
        this.writer.u32(lo);
      } else if (uint <= 0xffffffffffff) {
        this.writer.u8u16(TYPE_OVERLAY.NINT + 6, hi);
        this.writer.u32(lo);
      } else {
        this.writer.u16(((TYPE_OVERLAY.NINT + 7) << 8) + (hi >> 16));
        this.writer.u16(hi & 0xffff);
        this.writer.u32(lo);
      }
    }
  }

  public writeFloat(node: FloatAstNode): void {
    this.writer.u8f64(TYPE_OVERLAY.FLOT + 8, node.val);
  }

  public writeVUint(num: number): void {
    const writer = this.writer;
    if (num <= 0b1111111) {
      writer.u8(0b10000000 + num);
    } else if (num <= 0b1111111_1111111) {
      writer.ensureCapacity(2);
      const uint8 = writer.uint8;
      uint8[writer.x++] = num >>> 7;
      uint8[writer.x++] = 0b10000000 + (num & 0b01111111);
    } else if (num <= 0b1111111_1111111_1111111) {
      writer.ensureCapacity(3);
      const uint8 = writer.uint8;
      uint8[writer.x++] = num >>> 14;
      uint8[writer.x++] = (num >>> 7) & 0b01111111;
      uint8[writer.x++] = 0b10000000 + (num & 0b01111111);
    } else if (num <= 0b1111111_1111111_1111111_1111111) {
      writer.ensureCapacity(4);
      const uint8 = writer.uint8;
      uint8[writer.x++] = num >>> 21;
      uint8[writer.x++] = (num >>> 14) & 0b01111111;
      uint8[writer.x++] = (num >>> 7) & 0b01111111;
      uint8[writer.x++] = 0b10000000 + (num & 0b01111111);
    } else {
      let lo32 = num | 0;
      if (lo32 < 0) lo32 += 4294967296;
      const hi32 = (num - lo32) / 4294967296;
      if (num <= 0b1111111_1111111_1111111_1111111_1111111) {
        writer.ensureCapacity(5);
        const uint8 = writer.uint8;
        uint8[writer.x++] = (hi32 << 4) | (num >>> 28);
        uint8[writer.x++] = (num >>> 21) & 0b01111111;
        uint8[writer.x++] = (num >>> 14) & 0b01111111;
        uint8[writer.x++] = (num >>> 7) & 0b01111111;
        uint8[writer.x++] = 0b10000000 + (num & 0b01111111);
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111) {
        writer.ensureCapacity(6);
        const uint8 = writer.uint8;
        uint8[writer.x++] = (hi32 >>> 3) & 0b1111;
        uint8[writer.x++] = ((hi32 & 0b111) << 4) | (num >>> 28);
        uint8[writer.x++] = (num >>> 21) & 0b01111111;
        uint8[writer.x++] = (num >>> 14) & 0b01111111;
        uint8[writer.x++] = (num >>> 7) & 0b01111111;
        uint8[writer.x++] = 0b10000000 + (num & 0b01111111);
      }
    }
  }

  public writeStr(node: StrAstNode): void {
    const str = node.val;
    const length = node.len;
    const writer = this.writer;
    if (length < 14) writer.u8(TYPE_OVERLAY.STRI + length);
    else {
      writer.u8(TYPE_OVERLAY.STRI + 14);
      this.writeVUint(length);
    }
    writer.ensureCapacity(length * 4);
    writer.utf8(str);
  }

  public writeBin(node: BinAstNode): void {
    const buf = node.val;
    const length = node.len;
    const writer = this.writer;
    if (length < 14) writer.u8(TYPE_OVERLAY.BINA + length);
    else {
      writer.u8(TYPE_OVERLAY.BINA + 14);
      this.writeVUint(length);
    }
    writer.buf(buf, length);
  }

  public writeArr(node: ArrAstNode): void {
    const writer = this.writer;
    const arr = node.val;
    if (arr === null) {
      writer.u8(TYPE_OVERLAY.LIST + 15);
      return;
    }
    const length = node.len;
    if (length < 14) writer.u8(TYPE_OVERLAY.LIST + length);
    else {
      writer.u8(TYPE_OVERLAY.LIST + 14);
      this.writeVUint(length);
    }
    for (let i = 0; i < length; i++) this.writeAny(arr[i]);
  }

  public writeObj(node: ObjAstNode): void {
    const writer = this.writer;
    const arr = node.val;
    if (arr === null) {
      writer.u8(TYPE_OVERLAY.LIST + 15);
      return;
    }
    const length = node.len;
    if (length < 14) writer.u8(TYPE_OVERLAY.STRU + length);
    else {
      writer.u8(TYPE_OVERLAY.STRU + 14);
      this.writeVUint(length);
    }
    node.val!.forEach((n, symbolId) => {
      this.writeVUint(symbolId);
      this.writeAny(n);
    });
  }
}
