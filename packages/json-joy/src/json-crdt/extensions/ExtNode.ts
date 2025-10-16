import {printTs, type ITimestampStruct} from '../../json-crdt-patch/clock';
import type {JsonNode} from '..';
import type {Printable} from 'tree-dump/lib/types';

export abstract class ExtNode<N extends JsonNode, View = unknown> implements JsonNode<View>, Printable {
  public abstract readonly extId: number;
  public readonly id: ITimestampStruct;

  constructor(public readonly data: N) {
    this.id = data.id;
  }

  // -------------------------------------------------------- ExtensionJsonNode

  /**
   * @todo Maybe hardcode this as `ext` to be inline with other classes. And retrieve extension names differently.
   */
  public abstract name(): string;
  public abstract view(): View;

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
    return this.name() + (parentId ? ' ' + printTs(parentId) : '') + ' ' + this.data.toString(tab);
  }
}
