import {printTs, type ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ExtensionJsonNode, JsonNode} from '..';
import type {Printable} from 'tree-dump/lib/types';

export abstract class ExtensionNode<N extends JsonNode> implements ExtensionJsonNode<N>, Printable {
  public readonly id: ITimestampStruct;

  constructor(public readonly data: N) {
    this.id = data.id;
  }

  // -------------------------------------------------------- ExtensionJsonNode

  public abstract name(): string;
  public abstract view(): unknown;

  public children(callback: (node: JsonNode) => void): void {}

  public child?(): N {
    return this.data;
  }

  public container(): JsonNode | undefined {
    return this.data.container();
  }

  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string, parentId?: ITimestampStruct): string {
    return this.name() + (parentId ? ' ' + printTs(parentId) : '') + ', ' + this.data.toString(tab);
  }
}
