import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {ExtensionId} from '../constants';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';

export class MvalNode extends ExtNode<ArrNode> {
  public readonly extId = ExtensionId.mval;

  public name(): string {
    return MNEMONIC;
  }

  public view(): unknown[] {
    return this.data.view();
  }
}
