import {isEmpty} from '@jsonjoy.com/util/lib/isEmpty';
import {deepEqual} from '../../json-equal/deepEqual';
import {StrNode} from '../../json-crdt/nodes/str/StrNode';
import {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import {Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC, QuillConst} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {getAttributes} from './util';
import type {QuillDataNode, QuillDeltaAttributes, QuillDeltaOp, QuillDeltaOpInsert} from './types';
import type {StringChunk} from '../peritext/util/types';
import type {OverlayTuple} from '../peritext/overlay/types';

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

  /** @todo Cache this value based on overlay hash. */
  public view(): QuillDeltaOp[] {
    const ops: QuillDeltaOp[] = [];
    const overlay = this.txt.overlay;
    overlay.refresh(true);
    let chunk: undefined | StringChunk;
    const nextPair = overlay.tuples0(undefined);
    let pair: OverlayTuple<string> | undefined;
    while (pair = nextPair()) {
      const [p1, p2] = pair;
      const attributes: undefined | QuillDeltaAttributes = getAttributes(p1);
      let insert = '';
      chunk = overlay.chunkSlices0(chunk, p1, p2, (chunk, off, len) => {
        const data = chunk.data;
        // console.log(JSON.stringify(data), off, len);
        if (data) insert += data.slice(off, off + len);
      });
      if (insert) {
        if (insert === QuillConst.EmbedChar && attributes && attributes[QuillConst.EmbedSliceType]) {
          const op: QuillDeltaOpInsert = {insert: attributes[QuillConst.EmbedSliceType] as Record<string, unknown>};
          delete attributes[QuillConst.EmbedSliceType];
          if (!isEmpty(attributes)) op.attributes = attributes;
          ops.push(op);
          break;
        } else {
          const lastOp = ops[ops.length - 1] as QuillDeltaOpInsert;
          if (lastOp && typeof lastOp.insert === 'string' && deepEqual(lastOp.attributes, attributes)) {
            lastOp.insert += insert;
            break;
          }
        }
        const op: QuillDeltaOpInsert = {insert};
        if (attributes) op.attributes = attributes;
        ops.push(op);
      }
    }
    return ops;
  }
}
