import type {JsonNode} from '..';
import {type ITimestampStruct, tick} from '../../../json-crdt-patch/clock';
import {AbstractRga, type Chunk} from '../rga/AbstractRga';

/**
 * @ignore
 * @category CRDT Node
 */
export class BinChunk implements Chunk<Uint8Array> {
  public readonly id: ITimestampStruct;
  public span: number;
  public del: boolean;
  public data: Readonly<Uint8Array> | undefined;
  public len: number;
  public p: BinChunk | undefined;
  public l: BinChunk | undefined;
  public r: BinChunk | undefined;
  public p2: BinChunk | undefined;
  public l2: BinChunk | undefined;
  public r2: BinChunk | undefined;
  public s: BinChunk | undefined;

  constructor(id: ITimestampStruct, span: number, buf: Readonly<Uint8Array> | undefined) {
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

  public split(ticks: number): BinChunk {
    if (!this.del) {
      const data = this.data!;
      const rightBuffer = data.subarray(ticks);
      const chunk = new BinChunk(tick(this.id, ticks), this.span - ticks, rightBuffer);
      this.data = data.subarray(0, ticks);
      this.span = ticks;
      return chunk;
    }
    const chunk = new BinChunk(tick(this.id, ticks), this.span - ticks, undefined);
    this.span = ticks;
    return chunk;
  }

  public delete(): void {
    this.del = true;
    this.data = undefined;
  }

  public clone(): BinChunk {
    const chunk = new BinChunk(this.id, this.span, this.data);
    return chunk;
  }

  public view(): Uint8Array {
    return this.data || new Uint8Array(0);
  }
}

/**
 * Represents the `bin` type in JSON CRDT. The `bin` is a blob of binary data,
 * powered by a Replicated Growable Array (RGA) algorithm.
 *
 * @category CRDT Node
 */
export class BinNode extends AbstractRga<Uint8Array> implements JsonNode<Uint8Array> {
  // ----------------------------------------------------------------- JsonNode

  public name(): string {
    return 'bin';
  }

  /** @ignore */
  private _view: null | Uint8Array = null;
  public view(): Uint8Array {
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

  /** @ignore */
  public children() {}

  /** @ignore */
  public child() {
    return undefined;
  }

  /** @ignore */
  public container(): JsonNode | undefined {
    return undefined;
  }

  /** @ignore */
  public clone(): BinNode {
    const clone = new BinNode(this.id);
    const count = this.count;
    if (!count) return clone;
    let chunk = this.first();
    clone.ingest(count, () => {
      const ret = chunk!.clone();
      chunk = this.next(chunk!);
      return ret!;
    });
    return clone;
  }
  
  /** @ignore */
  public api: undefined | unknown = undefined;

  // -------------------------------------------------------------- AbstractRga

  /** @ignore */
  public createChunk(id: ITimestampStruct, buf: Uint8Array | undefined): BinChunk {
    return new BinChunk(id, buf ? buf.length : 0, buf);
  }

  /** @ignore */
  protected onChange(): void {
    this._view = null;
  }

  protected toStringName(): string {
    return this.name();
  }
}
