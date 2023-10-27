import {Const} from '../const/Const';
import {CRDT_CONSTANTS} from '../../constants';
import {printTree} from '../../../util/print/printTree';
import {compare, ITimestampStruct, toDisplayString} from '../../../json-crdt-patch/clock';
import type {Model} from '../../model';
import type {JsonNode, JsonNodeView} from '../../types';
import type {Printable} from '../../../util/print/types';

export class ArrayLww<Value extends JsonNode[] = JsonNode[]>
  implements JsonNode<Readonly<JsonNodeView<Value>>>, Printable
{
  public readonly elements: (ITimestampStruct | undefined)[] = [];

  constructor(public readonly doc: Model<any>, public readonly id: ITimestampStruct) {}

  public val(index: number): undefined | ITimestampStruct {
    return this.elements[index] as ITimestampStruct | undefined;
  }

  public get<Index extends number>(index: Index): undefined | Value[Index] {
    const id = this.val(index);
    if (!id) return undefined;
    return this.doc.index.get(id);
  }

  public put(index: number, id: ITimestampStruct): undefined | ITimestampStruct {
    if (index > CRDT_CONSTANTS.MAX_TUPLE_LENGTH) throw new Error('OUT_OF_BOUNDS');
    const currentId = this.val(index);
    if (currentId && compare(currentId, id) >= 0) return;
    if (index > this.elements.length) for (let i = this.elements.length; i < index; i++) this.elements.push(undefined);
    if (index < this.elements.length) this.elements[index] = id;
    else this.elements.push(id);
    return currentId;
  }

  private __extNode: JsonNode | undefined;

  public ext(): JsonNode | undefined {
    if (this.__extNode) return this.__extNode;
    const extensionId = this.getExtId();
    const isExtension = extensionId >= 0;
    if (!isExtension) return undefined;
    const extension = this.doc.ext.get(extensionId);
    if (!extension) return undefined;
    this.__extNode = new extension.Node(this.get(1)!);
    return this.__extNode;
  }

  public isExt(): boolean {
    return !!this.ext();
  }

  public getExtId(): number {
    if (this.elements.length !== 2) return -1;
    const type = this.get(0);
    if (!(type instanceof Const)) return -1;
    const buf = type.val;
    const id = this.id;
    if (!(buf instanceof Uint8Array) || buf.length !== 3 || buf[1] !== id.sid % 256 || buf[2] !== id.time % 256)
      return -1;
    return buf[0];
  }

  // ----------------------------------------------------------------- JsonNode

  public child(): JsonNode | undefined {
    return this.ext();
  }

  public container(): JsonNode | undefined {
    return this;
  }

  public children(callback: (node: JsonNode) => void) {
    if (this.isExt()) return;
    const elements = this.elements;
    const length = elements.length;
    const index = this.doc.index;
    for (let i = 0; i < length; i++) {
      const id = elements[i];
      if (!id) continue;
      const node = index.get(id);
      if (node) callback(node);
    }
  }

  private _view = [] as JsonNodeView<Value>;
  public view(): Readonly<JsonNodeView<Value>> {
    const extNode = this.ext();
    if (extNode) return extNode.view() as any;
    let useCache = true;
    const _view = this._view;
    const arr = [] as JsonNodeView<Value>;
    const index = this.doc.index;
    const elements = this.elements;
    const length = elements.length;
    for (let i = 0; i < length; i++) {
      const id = elements[i];
      const node = id ? index.get(id) : undefined;
      const value = node ? node.view() : undefined;
      if (_view[i] !== value) useCache = false;
      arr.push(value);
    }
    return useCache ? _view : (this._view = arr);
  }

  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const extNode = this.ext();
    const header =
      this.constructor.name + ' ' + toDisplayString(this.id) + (extNode ? ` { extension = ${this.getExtId()} }` : '');
    if (extNode) {
      return this.child()!.toString(tab);
    }
    return (
      header +
      printTree(tab, [
        ...this.elements.map(
          (id, i) => (tab: string) =>
            `${i}: ${!id ? 'nil' : this.doc.index.get(id)!.toString(tab + '  ' + ' '.repeat(('' + i).length))}`,
        ),
        ...(extNode ? [(tab: string) => `${this.child()!.toString(tab)}`] : []),
      ])
    );
  }
}
