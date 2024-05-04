import {MNEMONIC} from './constants';
import {ExtensionNode} from '../../json-crdt/extensions/ExtensionNode';
import {ExtensionId} from '../constants';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';

export class MvalNode extends ExtensionNode<ArrNode> {
  public readonly extId = ExtensionId.mval;

  public name(): string {
    return MNEMONIC;
  }

  public view(): unknown[] {
    return this.data.view();
  }
}
