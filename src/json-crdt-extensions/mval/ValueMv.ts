import {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import {printTree} from 'tree-dump/lib/printTree';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ExtensionJsonNode, JsonNode} from '../../json-crdt';
import type {Printable} from 'tree-dump/lib/types';

export class ValueMv implements ExtensionJsonNode, Printable {
  public readonly id: ITimestampStruct;

  constructor(public readonly data: ArrNode) {
    this.id = data.id;
  }

  // -------------------------------------------------------- ExtensionJsonNode

  public name(): string {
    return 'mval';
  }

  public view(): unknown[] {
    return this.data.view();
  }

  public children(callback: (node: JsonNode) => void): void {}

  public child?(): JsonNode | undefined {
    return this.data;
  }

  public container(): JsonNode | undefined {
    return this.data.container();
  }

  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string): string {
    return this.name() + printTree(tab, [(tab) => this.data.toString(tab)]);
  }
}
