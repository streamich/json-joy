import {MNEMONIC} from './constants';
import {ExtensionNode} from '../../json-crdt/extensions/ExtensionNode';
import type {PeritextDataNode} from './types';

export class PeritextNode extends ExtensionNode<PeritextDataNode> {
  public name(): string {
    return MNEMONIC;
  }

  public view(): string {
    const str = this.data.get(0)!;
    return str.view();
  }
}
