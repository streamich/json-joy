import type {JsonNode} from '../../types';
import {ITimestampStruct, tick} from '../../../json-crdt-patch/clock';
import {AbstractRga, Chunk} from '../rga/AbstractRga';

/**
 * @category CRDT Node
 */
export class BinaryChunk implements Chunk<Uint8Array> {
  public readonly id: ITimestampStruct;
  public span: number;
  public del: boolean;
  public data: Uint8Array | undefined;
  public len: number;
  public p: BinaryChunk | undefined;
  public l: BinaryChunk | undefined;
  public r: BinaryChunk | undefined;
  public p2: BinaryChunk | undefined;
  public l2: BinaryChunk | undefined;
  public r2: BinaryChunk | undefined;
  public s: BinaryChunk | undefined;

  constructor(id: ITimestampStruct, span: number, buf: Uint8Array | undefined) {
    this.id = id;
    this.span = span;
    this.len = buf ? span : 0;
    this.del = !buf;
    this.p = undefined;
    this.l = undefined;
    this.r = undefined;
    this.s = undefined;
    this.data = buf;
  }

  public merge(data: Uint8Array) {
    const length = this.data!.length;
    const combined = new Uint8Array(length + data.length);
    combined.set(this.data!);
    combined.set(data, length);
    this.data = combined;
    this.span = combined.length;
  }

  public split(ticks: number): BinaryChunk {
    if (!this.del) {
      const data = this.data!;
      const rightBuffer = data.subarray(ticks);
      const chunk = new BinaryChunk(tick(this.id, ticks), this.span - ticks, rightBuffer);
      this.data = data.subarray(0, ticks);
      this.span = ticks;
      return chunk;
    }
    const chunk = new BinaryChunk(tick(this.id, ticks), this.span - ticks, undefined);
    this.span = ticks;
    return chunk;
  }

  public delete(): void {
    this.del = true;
    this.data = undefined;
  }

  public clone(): BinaryChunk {
    const chunk = new BinaryChunk(this.id, this.span, this.data);
    return chunk;
  }
}

/**
 * @category CRDT Node
 */
export class BinaryRga extends AbstractRga<Uint8Array> implements JsonNode<Uint8Array> {
  // ----------------------------------------------------------------- JsonNode

  private _view: null | Uint8Array = null;
  public view(): Readonly<Uint8Array> {
    if (this._view) return this._view;
    const res = new Uint8Array(this.length());
    let offset = 0;
    let chunk = this.first();
    while (chunk) {
      if (!chunk.del) {
        const buf = chunk.data!;
        res.set(buf, offset);
        offset += buf.length;
      }
      chunk = this.next(chunk);
    }
    return (this._view = res);
  }

  public children() {}

  public child() {
    return undefined;
  }

  public container(): JsonNode | undefined {
    return undefined;
  }

  public api: undefined | unknown = undefined;

  // -------------------------------------------------------------- AbstractRga

  public createChunk(id: ITimestampStruct, buf: Uint8Array | undefined): BinaryChunk {
    return new BinaryChunk(id, buf ? buf.length : 0, buf);
  }

  protected onChange(): void {
    this._view = null;
  }
}
