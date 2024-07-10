import {StrNode} from '../../json-crdt/nodes/str/StrNode';
import {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import {Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import type {QuillDataNode} from './types';

export class QuillDeltaNode extends ExtNode<QuillDataNode> {
  public readonly txt: Peritext<string>;

  constructor(public readonly data: QuillDataNode) {
    super(data);
    this.txt = new Peritext<string>(data.doc, this.text(), this.slices());
  }

  public text(): StrNode<string> {
    return this.data.get(0)!;
  }

  public slices(): ArrNode {
    return this.data.get(1)!;
  }

  // ------------------------------------------------------------------ ExtNode
  public readonly extId = ExtensionId.quill;

  public name(): string {
    return MNEMONIC;
  }

  public view(): string {
    return this.text().view();
  }
}
