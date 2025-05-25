import {isEmpty} from '@jsonjoy.com/util/lib/isEmpty';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC, QuillConst} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {getAttributes} from './util';
import {updateRga} from '../../json-crdt/hash';
import type {StrNode} from '../../json-crdt/nodes/str/StrNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {StringChunk} from '../peritext/util/types';
import type {OverlayTuple} from '../peritext/overlay/types';
import type {QuillDataNode, QuillDeltaAttributes, QuillDeltaOp, QuillDeltaOpInsert} from './types';
import type {ObjNode} from '../../json-crdt/nodes';

export class QuillDeltaNode extends ExtNode<QuillDataNode> {
  public readonly txt: Peritext<string>;

  constructor(public readonly data: QuillDataNode) {
    super(data);
    this.txt = new Peritext<string>(data.doc, this.text(), this.slices(), data.doc.api.wrap(this.docdata()));
  }

  public text(): StrNode<string> {
    return this.data.get(0)!;
  }

  public slices(): ArrNode {
    return this.data.get(1)!;
  }
  
  public docdata(): ObjNode<{}> {
    return this.data.get(2)!;
  }

  // ------------------------------------------------------------------ ExtNode
  public readonly extId = ExtensionId.quill;

  public name(): string {
    return MNEMONIC;
  }

  private _view: QuillDeltaOp[] = [];
  private _viewHash: number = -1;

  public view(): QuillDeltaOp[] {
    const overlay = this.txt.overlay;
    const hash = updateRga(overlay.refresh(true), this.txt.str);
    if (hash === this._viewHash) return this._view;
    const ops: QuillDeltaOp[] = [];
    let chunk: undefined | StringChunk;
    const nextTuple = overlay.tuples0(undefined);
    let tuple: OverlayTuple<string> | undefined;
    while ((tuple = nextTuple())) {
      const [p1, p2] = tuple;
      const attributes: undefined | QuillDeltaAttributes = getAttributes(p1);
      let insert = '';
      chunk = overlay.chunkSlices0(chunk, p1, p2, (chunk, off, len) => {
        const data = chunk.data;
        if (data) insert += data.slice(off, off + len);
      });
      if (insert) {
        if (insert === QuillConst.EmbedChar && attributes && attributes[QuillConst.EmbedSliceType]) {
          const op: QuillDeltaOpInsert = {insert: attributes[QuillConst.EmbedSliceType] as Record<string, unknown>};
          delete attributes[QuillConst.EmbedSliceType];
          if (!isEmpty(attributes)) op.attributes = attributes;
          ops.push(op);
          continue;
        } else {
          const lastOp = ops[ops.length - 1] as QuillDeltaOpInsert;
          if (lastOp && typeof lastOp.insert === 'string' && deepEqual(lastOp.attributes, attributes)) {
            lastOp.insert += insert;
            continue;
          }
        }
        const op: QuillDeltaOpInsert = {insert};
        if (attributes) op.attributes = attributes;
        ops.push(op);
      }
    }
    this._viewHash = hash;
    this._view = ops;
    return ops;
  }
}
