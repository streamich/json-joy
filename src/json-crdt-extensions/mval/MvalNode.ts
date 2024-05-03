import {MNEMONIC} from './constants';
import {ExtensionNode} from '../../json-crdt/extensions/ExtensionNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';

export class MvalNode extends ExtensionNode<ArrNode> {
  public name(): string {
    return MNEMONIC;
  }

  public view(): unknown[] {
    return this.data.view();
  }
}
