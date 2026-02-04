import {ConNode} from '../const/ConNode';
import {CRDT_CONSTANTS} from '../../constants';
import {printTree} from 'tree-dump/lib/printTree';
import {compare, type ITimestampStruct, printTs} from '../../../json-crdt-patch/clock';
import type {Model} from '../../model';
import type {JsonNode, JsonNodeView} from '..';
import type {Printable} from 'tree-dump/lib/types';
import type {ExtNode} from '../../extensions/ExtNode';
import type {VecNodeExtensionData} from '../../schema/types';

/**
 * Represents a `vec` JSON CRDT node, which is a LWW array.
 *
 * Vector is, usually a fixed length, last-write-wins array. Each element
 * in the array is a reference to another JSON CRDT node. The vector
 * can be extended by adding new elements to the end of the array.
 *
 * @category CRDT Node
 */
export class VecNode<Value extends JsonNode[] = JsonNode[]> implements JsonNode<JsonNodeView<Value>>, Printable {
  /**
   * @ignore
   */
  public readonly elements: (ITimestampStruct | undefined)[] = [];

  constructor(
    /**
     * @ignore
     */
    public readonly doc: Model<any>,
    public readonly id: ITimestampStruct,
  ) {}

  public length(): number {
    return this.elements.length;
  }

  /**
   * Retrieves the ID of an element at the given index.
   *
   * @param index Index of the element to get.
   * @returns ID of the element at the given index, if any.
   */
  public val(index: number): ITimestampStruct | undefined {
    return this.elements[index] as ITimestampStruct | undefined;
  }

  /**
   * Retrieves the JSON CRDT node at the given index.
   *
   * @param index Index of the element to get.
   * @returns JSON CRDT node at the given index, if any.
   */
  public get<Index extends number>(index: Index): Value[Index] | undefined {
    const id = this.elements[index] as ITimestampStruct | undefined;
    if (!id) return undefined;
    return this.doc.index.get(id);
  }

  /**
   * @ignore
   */
  public put(index: number, id: ITimestampStruct): ITimestampStruct | undefined {
    if (index > CRDT_CONSTANTS.MAX_TUPLE_LENGTH) throw new Error('OUT_OF_BOUNDS');
    const currentId = this.val(index);
    if (currentId && compare(currentId, id) >= 0) return;
    if (index > this.elements.length) for (let i = this.elements.length; i < index; i++) this.elements.push(undefined);
    if (index < this.elements.length) this.elements[index] = id;
    else this.elements.push(id);
    return currentId;
  }

  // ----------------------------------------------------------------- extension

  /**
   * @ignore
   */
  private __extNode: VecNodeExtensionData<Value> = <any>undefined;

  /**
   * @ignore
   * @returns Returns the extension data node if this is an extension node,
   *          otherwise `undefined`. The node is cached after the first access.
   */
  public ext(): VecNodeExtensionData<Value> {
    if (this.__extNode) return this.__extNode;
    const extensionId = this.getExtId();
    const isExtension = extensionId >= 0;
    if (!isExtension) return <any>undefined;
    const extension = this.doc.ext.get(extensionId);
    if (!extension) return <any>undefined;
    this.__extNode = new extension.Node(this.get(1)!);
    return this.__extNode;
  }

  /**
   * @ignore
   */
  public isExt(): boolean {
    return !!this.ext();
  }

  /**
   * @ignore
   * @returns Returns extension ID if this is an extension node, otherwise -1.
   */
  public getExtId(): number {
    if (this.elements.length !== 2) return -1;
    const type = this.get(0);
    if (!(type instanceof ConNode)) return -1;
    const buf = type.val;
    const id = this.id;
    if (!(buf instanceof Uint8Array) || buf.length !== 3 || buf[1] !== id.sid % 256 || buf[2] !== id.time % 256)
      return -1;
    return buf[0];
  }

  /** ------------------------------------------------------ {@link JsonNode} */

  public name(): string {
    return 'vec';
  }

  /** @ignore */
  public child(): ExtNode<JsonNode> | undefined {
    return this.ext();
  }

  /** @ignore */
  public container(): JsonNode | undefined {
    return this;
  }

  /** @ignore */
  public children(callback: (node: JsonNode) => void) {
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

  /** @ignore */
  private _view = [] as JsonNodeView<Value>;

  /** @ignore */
  public view(): JsonNodeView<Value> {
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

  /** @ignore */
  public api: undefined | unknown = undefined;

  /** @ignore */
  public parent: JsonNode | undefined = undefined;

  /**
   * @ignore
   *
   * - `doc`: provided
   * - `id`: shared, immutable
   * - `elements`: shallow copy, elements are immutable
   * - `__extNode`: not copied, will be lazily initialized
   * - `_view`: not copied, will be lazily initialized
   * - `api`: not copied
   */
  public clone(doc: Model<any>): VecNode<any> {
    const clone = new VecNode<Value>(doc, this.id);
    const elements = this.elements;
    const length = elements.length;
    for (let i = 0; i < length; i++) clone.elements.push(elements[i]);
    return clone as any;
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab: string = ''): string {
    const extNode = this.ext();
    const header = this.name() + ' ' + printTs(this.id) + (extNode ? ` { extension = ${this.getExtId()} }` : '');
    if (extNode) {
      return this.child()!.toString(tab, this.id);
    }
    const index = this.doc.index;
    return (
      header +
      printTree(tab, [
        ...this.elements.map(
          (id, i) => (tab: string) =>
            `${i}: ${
              !id ? 'nil' : index.get(id) ? index.get(id)!.toString(tab + '  ' + ' '.repeat(('' + i).length)) : 'nil'
            }`,
        ),
        ...(extNode ? [(tab: string) => `${this.child()!.toString(tab)}`] : []),
      ])
    );
  }
}
