import {MNEMONIC} from './constants';
import {ExtensionNode} from '../../json-crdt/extensions/ExtensionNode';
import {ExtensionId} from '../constants';
import type {StrNode} from '../../json-crdt/nodes';
import type {PeritextDataNode} from './types';

export class PeritextNode extends ExtensionNode<PeritextDataNode> {
  public readonly extId = ExtensionId.peritext;

  public name(): string {
    return MNEMONIC;
  }

  public text(): StrNode {
    return this.data.get(0)!;
  }

  public view(): string {
    return this.text().view();
  }
}
