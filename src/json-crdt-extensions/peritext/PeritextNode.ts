import {MNEMONIC} from './constants';
import {ExtensionNode} from '../../json-crdt/extensions/ExtensionNode';
import {ExtensionId} from '../constants';
import type {ArrNode, StrNode} from '../../json-crdt/nodes';
import type {PeritextDataNode} from './types';
import type {SliceNode} from './slice/types';

export class PeritextNode extends ExtensionNode<PeritextDataNode> {
  public text(): StrNode<string> {
    return this.data.get(0)!;
  }

  public slices(): ArrNode<SliceNode> {
    return this.data.get(1)!;
  }

  // ------------------------------------------------------------ ExtensionNode
  public readonly extId = ExtensionId.peritext;

  public name(): string {
    return MNEMONIC;
  }

  public view(): string {
    return this.text().view();
  }
}
