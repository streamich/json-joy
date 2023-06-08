import {AbstractRga, Chunk} from '../rga/AbstractRga';
import {ITimestampStruct, tick} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {printBinary} from '../../../util/print/printBinary';
import {printTree} from '../../../util/print/printTree';
import type {JsonNode} from '../../types';
import type {Printable} from '../../../util/print/types';

type E = ITimestampStruct;

const Empty: unknown[] = [];

export class ArrayChunk implements Chunk<E[]> {
  public readonly id: ITimestampStruct;
  public span: number;
  public del: boolean;
  public data: E[] | undefined;
  public len: number;
  public p: ArrayChunk | undefined;
  public l: ArrayChunk | undefined;
  public r: ArrayChunk | undefined;
  public p2: ArrayChunk | undefined;
  public l2: ArrayChunk | undefined;
  public r2: ArrayChunk | undefined;
  public s: ArrayChunk | undefined;

  constructor(id: ITimestampStruct, span: number, data: E[] | undefined) {
    this.id = id;
    this.span = span;
    this.len = data ? span : 0;
    this.del = !data;
    this.p = undefined;
    this.l = undefined;
    this.r = undefined;
    this.s = undefined;
    this.data = data;
  }

  public merge(data: E[]) {
    this.data!.push(...data);
    this.span = this.data!.length;
  }

  public split(ticks: number): ArrayChunk {
    const span = this.span;
    this.span = ticks;
    if (!this.del) {
      const data = this.data!;
      const rightData = data.splice(ticks);
      const chunk = new ArrayChunk(tick(this.id, ticks), span - ticks, rightData);
      return chunk;
    }
    return new ArrayChunk(tick(this.id, ticks), span - ticks, undefined);
  }

  public delete(): void {
    this.del = true;
    this.data = undefined;
  }

  public clone(): ArrayChunk {
    return new ArrayChunk(this.id, this.span, this.data ? [...this.data] : undefined);
  }
}

export class ArrayRga extends AbstractRga<E[]> implements JsonNode, Printable {
  constructor(public readonly doc: Model, id: ITimestampStruct) {
    super(id);
  }

  protected create(): ArrayRga {
    return new ArrayRga(this.doc, this.id);
  }

  public createChunk(id: ITimestampStruct, data: E[] | undefined): ArrayChunk {
    return new ArrayChunk(id, data ? data.length : 0, data);
  }

  protected onViewChange(): void {
    this._view = Empty;
  }

  private _view: unknown[] = Empty;
  public view(): unknown[] {
    const arr: unknown[] = [];
    let chunk = this.first();
    const index = this.doc.index;
    while (chunk) {
      if (!chunk.del) for (const node of chunk.data!) arr.push(index.get(node)!.view());
      chunk = this.next(chunk);
    }
    const _view = this._view;
    if (arr.length !== _view.length) return (this._view = arr);
    for (let i = 0; i < arr.length; i++) if (arr[i] !== _view[i]) return (this._view = arr);
    return _view;
  }

  public children(callback: (node: JsonNode) => void) {
    const index = this.doc.index;
    for (let chunk = this.first(); chunk; chunk = this.next(chunk))
      if (!chunk.del) for (const node of chunk.data!) callback(index.get(node)!);
  }

  public get(position: number): E | undefined {
    const pair = this.findChunk(position);
    if (!pair) return undefined;
    return pair[0].data![pair[1]];
  }

  public getNode(position: number): JsonNode | undefined {
    const id = this.get(position);
    if (!id) return undefined;
    return this.doc.index.get(id);
  }

  public getById(id: ITimestampStruct): E | undefined {
    const chunk = this.findById(id);
    if (!chunk || chunk.del) return undefined;
    const offset = id.time - chunk.id.time;
    return chunk.data![offset];
  }

  public child() {
    return undefined;
  }

  public container(): JsonNode | undefined {
    return this;
  }

  // ---------------------------------------------------------------- Printable

  protected printChunk(tab: string, chunk: ArrayChunk): string {
    const pos = this.pos(chunk);
    let valueTree = '';
    if (!chunk.del) {
      const index = this.doc.index;
      valueTree = printTree(
        tab,
        chunk.data!.map(
          (id, i) => (tab) => `[${pos + i}]: ${index.get(id)!.toString(tab + '    ' + ' '.repeat(String(i).length))}`,
        ),
      );
    }
    return (
      this.formatChunk(chunk) +
      valueTree +
      printBinary(tab, [
        chunk.l ? (tab) => this.printChunk(tab, chunk.l!) : null,
        chunk.r ? (tab) => this.printChunk(tab, chunk.r!) : null,
      ])
    );
  }
}
