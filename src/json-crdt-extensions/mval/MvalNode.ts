import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';

export class MvalNode extends ExtNode<ArrNode> {
  // ------------------------------------------------------------------ ExtNode

  public name(): string {
    return MNEMONIC;
  }

  public view(): unknown[] {
    return this.data.view();
  }
}
