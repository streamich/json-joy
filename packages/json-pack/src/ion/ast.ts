import {utf8Size} from '@jsonjoy.com/util/lib/strings/utf8';
import type {Import} from './Import';

export interface AstNode<T> {
  /** Node value as JS value. */
  readonly val: T;
  /** Node representation length. */
  readonly len: number;
  /** Total length of the node. */
  byteLength(): number;
}

export class NullAstNode implements AstNode<null> {
  public readonly val = null;
  public readonly len = 1;
  public byteLength(): number {
    return 1;
  }
}

export class BoolAstNode implements AstNode<boolean> {
  public readonly len = 1;
  constructor(public readonly val: boolean) {}
  public byteLength(): number {
    return 1;
  }
}

export class UintAstNode implements AstNode<number> {
  public readonly len: number;
  constructor(public readonly val: number) {
    if (!val) this.len = 0;
    else if (val <= 0xff) this.len = 1;
    else if (val <= 0xffff) this.len = 2;
    else if (val <= 0xffffff) this.len = 3;
    else if (val <= 0xffffffff) this.len = 4;
    else if (val <= 0xffffffffff) this.len = 5;
    else if (val <= 0xffffffffffff) this.len = 6;
    else this.len = 7;
  }
  public byteLength(): number {
    return 1 + this.len;
  }
}

export class NintAstNode implements AstNode<number> {
  public readonly len: number;
  constructor(public readonly val: number) {
    const uint = -val;
    if (!uint) this.len = 0;
    else if (uint <= 0xff) this.len = 1;
    else if (uint <= 0xffff) this.len = 2;
    else if (uint <= 0xffffff) this.len = 3;
    else if (uint <= 0xffffffff) this.len = 4;
    else if (uint <= 0xffffffffff) this.len = 5;
    else if (uint <= 0xffffffffffff) this.len = 6;
    else this.len = 7;
  }
  public byteLength(): number {
    return 1 + this.len;
  }
}

export class FloatAstNode implements AstNode<number> {
  public readonly len: number = 8;
  constructor(public readonly val: number) {}
  public byteLength(): number {
    return 1 + this.len;
  }
}

const vUintLen = (num: number): number => {
  if (num <= 0b1111111) return 1;
  else if (num <= 0b1111111_1111111) return 2;
  else if (num <= 0b1111111_1111111_1111111) return 3;
  else if (num <= 0b1111111_1111111_1111111_1111111) return 4;
  else if (num <= 0b1111111_1111111_1111111_1111111_1111111) return 5;
  else return 6;
};

export class StrAstNode implements AstNode<string> {
  public readonly len: number;
  constructor(public readonly val: string) {
    this.len = utf8Size(val);
  }
  public byteLength(): number {
    return this.len < 14 ? 1 + this.len : 1 + vUintLen(this.len) + this.len;
  }
}

export class BinAstNode implements AstNode<Uint8Array> {
  public readonly len: number;
  constructor(public readonly val: Uint8Array) {
    this.len = val.length;
  }
  public byteLength(): number {
    return this.len < 14 ? 1 + this.len : 1 + vUintLen(this.len) + this.len;
  }
}

export class ArrAstNode implements AstNode<AstNode<unknown>[] | null> {
  public readonly len: number;
  constructor(public readonly val: AstNode<unknown>[] | null) {
    if (val === null) {
      this.len = 1;
    } else {
      if (!val.length) this.len = 0;
      else {
        let elementLength = 0;
        for (let i = 0; i < val.length; i++) elementLength += val[i].byteLength();
        this.len = elementLength;
      }
    }
  }
  public byteLength(): number {
    return this.len < 14 ? 1 + this.len : 1 + vUintLen(this.len) + this.len;
  }
}

export class ObjAstNode implements AstNode<Map<number, AstNode<unknown>> | null> {
  public readonly len: number;
  constructor(public readonly val: Map<number, AstNode<unknown>> | null) {
    if (val === null) {
      this.len = 1;
    } else {
      if (!val.size) this.len = 0;
      else {
        let len = 0;
        val.forEach((node, symbolId) => {
          len += vUintLen(symbolId) + node.byteLength();
        });
        this.len = len;
      }
    }
  }
  public byteLength(): number {
    return this.len < 14 ? 1 + this.len : 1 + vUintLen(this.len) + this.len;
  }
}

export class AnnotationAstNode implements AstNode<AstNode<unknown>> {
  public readonly len: number;
  public readonly annotationLen: number;
  constructor(
    public readonly val: AstNode<unknown>,
    public readonly annotations: number[],
  ) {
    let len = 0;
    for (let i = 0; i < annotations.length; i++) len += vUintLen(annotations[i]);
    this.annotationLen = len;
    len += vUintLen(len);
    len += val.byteLength();
    this.len = len;
  }
  public byteLength(): number {
    return this.len < 14 ? 1 + this.len : 1 + vUintLen(this.len) + this.len;
  }
}

const isSafeInteger = Number.isSafeInteger;

export const toAst = (val: unknown, symbols: Import): AstNode<unknown> => {
  if (val === null) return new NullAstNode();
  if (val instanceof Array) return new ArrAstNode(val.map((el) => toAst(el, symbols)));
  if (val instanceof Uint8Array) return new BinAstNode(val);
  switch (typeof val) {
    case 'boolean':
      return new BoolAstNode(val);
    case 'number': {
      if (isSafeInteger(val)) return val >= 0 ? new UintAstNode(val) : new NintAstNode(val);
      else return new FloatAstNode(val);
    }
    case 'string':
      return new StrAstNode(val);
    case 'object': {
      const struct = new Map<number, AstNode<unknown>>();
      for (const key in val) {
        const symbolId = symbols.add(key);
        struct.set(symbolId, toAst((val as any)[key], symbols));
      }
      return new ObjAstNode(struct);
    }
  }
  throw new Error('UNKNOWN_TYPE');
};
