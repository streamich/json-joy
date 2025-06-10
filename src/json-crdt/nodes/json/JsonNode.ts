import {AbstractRga, type Chunk} from '../rga/AbstractRga';
import {type ITimestampStruct, tick} from '../../../json-crdt-patch/clock';
import {printBinary} from 'tree-dump/lib/printBinary';
import {printTree} from 'tree-dump/lib/printTree';
import type {Model} from '../../model';
import type {JsonNode, JsonNodeView} from '..';
import type {Printable} from 'tree-dump/lib/types';


class JsonToken {}
class JsonTextToken extends JsonToken {}
class JsonControlToken extends JsonToken {}
class JsonObjectStartToken extends JsonControlToken {}
class JsonObjectEntryDividerToken extends JsonControlToken {}
class JsonObjectEntryEndToken extends JsonControlToken {}
class JsonObjectEndToken extends JsonControlToken {}
class JsonCompositeToken extends JsonToken {}

type Token = JsonTextToken | JsonObjectStartToken | JsonObjectEntryDividerToken | JsonObjectEntryEndToken | JsonObjectEndToken | JsonCompositeToken;

class JsonChunkData {
  public readonly data: Token[] = [];
}

/**
 * @ignore
 * @category CRDT Node
 */
export class JsonChunk implements Chunk<JsonChunkData> {
  public readonly id: ITimestampStruct;
  public span: number;
  public del: boolean;
  public data: JsonChunkData | undefined;
  public len: number;
  public p: JsonChunk | undefined;
  public l: JsonChunk | undefined;
  public r: JsonChunk | undefined;
  public p2: JsonChunk | undefined;
  public l2: JsonChunk | undefined;
  public r2: JsonChunk | undefined;
  public s: JsonChunk | undefined;

  constructor(id: ITimestampStruct, span: number, data: JsonChunkData | undefined) {
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

  public merge(data: JsonChunkData) {
    throw new Error('not implemented');
    // this.data!.push(...data);
    // this.span = this.data!.length;
  }

  public split(ticks: number): JsonChunk {
    throw new Error('not implemented');
    // const span = this.span;
    // this.span = ticks;
    // if (!this.del) {
    //   const data = this.data!;
    //   const rightData = data.splice(ticks);
    //   const chunk = new JsonChunk(tick(this.id, ticks), span - ticks, rightData);
    //   return chunk;
    // }
    // return new JsonChunk(tick(this.id, ticks), span - ticks, undefined);
  }

  public delete(): void {
    throw new Error('not implemented');
    // this.del = true;
    // this.data = undefined;
  }

  public clone(): JsonChunk {
    throw new Error('not implemented');
    // return new JsonChunk(this.id, this.span, this.data ? [...this.data] : undefined);
  }

  public view(): JsonChunkData {
    throw new Error('not implemented');
    // return this.data ? [...this.data] : [];
  }
}

/**
 * Represents the `arr` JSON CRDT type, which is a Replicated Growable Array
 * (RGA). Each element ot the array is a reference to another JSON CRDT node.
 *
 * @category CRDT Node
 */
export class ArrNode<Element extends JsonNode = JsonNode>
  extends AbstractRga<JsonChunkData>
  implements JsonNode<JsonNodeView<Element>[]>, Printable
{
  constructor(
    public readonly doc: Model<any>,
    id: ITimestampStruct,
  ) {
    super(id);
  }

  // -------------------------------------------------------------- AbstractRga

  /** @ignore */
  public createChunk(id: ITimestampStruct, data: JsonChunkData | undefined): JsonChunk {
    throw new Error('not implemented');
    // return new JsonChunk(id, data ? data.length : 0, data);
  }

  /** @ignore */
  protected onChange(): void {}

  protected toStringName(): string {
    return this.name();
  }

  // ----------------------------------------------------------------- JsonNode

  /** @ignore */
  public child() {
    return undefined;
  }

  /** @ignore */
  public container(): JsonNode | undefined {
    return this;
  }

  /** @ignore */
  private _view: unknown[] = [];
  public view(): JsonNodeView<Element>[] {
    throw new Error('not implemented');
  }

  /** @ignore */
  public children(callback: (node: JsonNode) => void) {
    const index = this.doc.index;
    for (let chunk = this.first(); chunk; chunk = this.next(chunk)) {
      const data = chunk.data;
      if (!data) continue;
      const length = data.length;
      for (let i = 0; i < length; i++) callback(index.get(data[i])!);
    }
  }

  /** @ignore */
  public api: undefined | unknown = undefined;

  public name(): string {
    return 'arr';
  }
}
