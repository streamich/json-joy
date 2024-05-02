import {printTree} from 'tree-dump/lib/printTree';
import {MNEMONIC} from './constants';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ExtensionJsonNode, JsonNode} from '../../json-crdt';
import type {Printable} from 'tree-dump/lib/types';
import type {PeritextDataNode} from './types';

export class PeritextNode implements ExtensionJsonNode, Printable {
  public readonly id: ITimestampStruct;

  constructor(public readonly data: PeritextDataNode) {
    this.id = data.id;
  }

  // -------------------------------------------------------- ExtensionJsonNode

  public name(): string {
    return MNEMONIC;
  }

  public view(): string {
    const str = this.data.get(0)!;
    return str.view();
  }

  public children(callback: (node: JsonNode) => void): void {}

  public child?(): PeritextDataNode {
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
