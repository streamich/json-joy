import {QuillConst} from './constants';
import {PathStep} from '../../json-pointer';
import {QuillDeltaNode} from './QuillDeltaNode';
import {NodeApi} from '../../json-crdt/model/api/nodes';
import {konst} from '../../json-crdt-patch/builder/Konst';
import {SliceBehavior} from '../peritext/slice/constants';
import {PersistedSlice} from '../peritext/slice/PersistedSlice';
import {diffAttributes, getAttributes, removeErasures} from './util';
import type {ExtApi} from '../../json-crdt';
import type {
  QuillDeltaAttributes,
  QuillDeltaOpDelete,
  QuillDeltaOpInsert,
  QuillDeltaOpRetain,
  QuillDeltaPatch,
} from './types';
import type {Peritext} from '../peritext';

const updateAttributes = (txt: Peritext, attributes: QuillDeltaAttributes | undefined, pos: number, len: number) => {
  if (!attributes) return;
  const range = txt.rangeAt(pos, len);
  const keys = Object.keys(attributes);
  const length = keys.length;
  const savedSlices = txt.savedSlices;
  for (let i = 0; i < length; i++) {
    const key = keys[i];
    const value = attributes[key];
    if (value === null) {
      savedSlices.ins(range, SliceBehavior.Erase, key);
    } else {
      savedSlices.ins(range, SliceBehavior.Overwrite, key, konst(value));
    }
  }
};

const rewriteAttributes = (txt: Peritext, attributes: QuillDeltaAttributes | undefined, pos: number, len: number) => {
  if (!attributes) return;
  const range = txt.rangeAt(pos, len);
  range.expand();
  const slices = txt.overlay.findOverlapping(range);
  const length = slices.size;
  const relevantOverlappingButNotContained = new Set<PathStep>();
  if (length) {
    const savedSlices = txt.savedSlices;
    slices.forEach((slice) => {
      if (slice instanceof PersistedSlice) {
        const isContained = range.contains(slice);
        if (!isContained) {
          relevantOverlappingButNotContained.add(slice.type as PathStep);
          return;
        }
        const type = slice.type as PathStep;
        if (type in attributes) {
          savedSlices.del(slice.id);
        }
      }
    });
  }
  const keys = Object.keys(attributes);
  const attributeLength = keys.length;
  const attributesCopy = {...attributes};
  for (let i = 0; i < attributeLength; i++) {
    const key = keys[i];
    const value = attributes[key];
    if (value === null && !relevantOverlappingButNotContained.has(key)) {
      delete attributesCopy[key];
    }
  }
  updateAttributes(txt, attributesCopy, pos, len);
};

const maybeUpdateAttributes = (
  txt: Peritext,
  attributes: QuillDeltaAttributes | undefined,
  pos: number,
  len: number,
): void => {
  const range = txt.rangeAt(pos, 1);
  const overlayPoint = txt.overlay.getOrNextLower(range.start);
  if (!overlayPoint && !attributes) return;
  if (!overlayPoint) {
    updateAttributes(txt, removeErasures(attributes), pos, len);
    return;
  }
  const pointAttributes = getAttributes(overlayPoint);
  const attributeDiff = diffAttributes(pointAttributes, attributes);
  if (attributeDiff) updateAttributes(txt, attributeDiff, pos, len);
};

export class QuillDeltaApi extends NodeApi<QuillDeltaNode> implements ExtApi<QuillDeltaNode> {
  public apply(ops: QuillDeltaPatch['ops']) {
    const txt = this.node.txt;
    const overlay = txt.overlay;
    const length = ops.length;
    let pos = 0;
    for (let i = 0; i < length; i++) {
      overlay.refresh(true);
      const op = ops[i];
      if (typeof (<QuillDeltaOpRetain>op).retain === 'number') {
        const {retain, attributes} = <QuillDeltaOpRetain>op;
        rewriteAttributes(txt, attributes, pos, retain);
        pos += retain;
      } else if (typeof (<QuillDeltaOpDelete>op).delete === 'number') {
        txt.delAt(pos, (<QuillDeltaOpDelete>op).delete);
      } else if ((<QuillDeltaOpInsert>op).insert) {
        const {insert} = <QuillDeltaOpInsert>op;
        let {attributes} = <QuillDeltaOpInsert>op;
        if (typeof insert === 'string') {
          txt.insAt(pos, insert);
          const insertLength = insert.length;
          maybeUpdateAttributes(txt, attributes, pos, insertLength);
          pos += insertLength;
        } else {
          txt.insAt(pos, QuillConst.EmbedChar);
          if (!attributes) attributes = {};
          attributes[QuillConst.EmbedSliceType] = insert;
          maybeUpdateAttributes(txt, attributes, pos, 1);
          pos += 1;
        }
      }
    }
  }
}
