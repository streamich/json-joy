import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import type {PeritextDataNode} from './types';

export class PeritextNode extends ExtNode<PeritextDataNode> {
  // ------------------------------------------------------------------ ExtNode

  public name(): string {
    return MNEMONIC;
  }

  public view(): string {
    const str = this.data.get(0)!;
    return str.view();
  }
}
