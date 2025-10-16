import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {ExtensionId} from '../constants';
import type {ArrNode, StrNode} from '../../json-crdt/nodes';
import type {PeritextDataNode} from './types';
import type {SliceNode} from './slice/types';

export class PeritextNode extends ExtNode<PeritextDataNode> {
  public text(): StrNode<string> {
    return this.data.get(0)!;
  }

  public slices(): ArrNode<SliceNode> {
    return this.data.get(1)!;
  }

  // ------------------------------------------------------------------ ExtNode
  public readonly extId = ExtensionId.peritext;

  public name(): string {
    return MNEMONIC;
  }

  public view(): string {
    return this.text().view();
  }
}
