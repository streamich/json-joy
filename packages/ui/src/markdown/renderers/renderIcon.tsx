import * as React from 'react';
import type {RenderNode} from '../types';
import EmojiInlineLazy from '../inline/emoji/lazy';
import Piece from '../components/chess/Piece/lazy';

const wP = <Piece piece="wP" />;
const wR = <Piece piece="wR" />;
const wN = <Piece piece="wN" />;
const wB = <Piece piece="wB" />;
const wQ = <Piece piece="wQ" />;
const wK = <Piece piece="wK" />;
const bP = <Piece piece="bP" />;
const bR = <Piece piece="bR" />;
const bN = <Piece piece="bN" />;
const bB = <Piece piece="bB" />;
const bQ = <Piece piece="bQ" />;
const bK = <Piece piece="bK" />;

const icons = {
  wP,
  wp: wP,
  P: wP,

  wR,
  wr: wR,
  R: wR,

  wN,
  wn: wN,
  N: wN,

  wB,
  wb: wB,
  B: wB,

  wQ,
  wq: wQ,
  Q: wQ,

  wK,
  wk: wK,
  K: wK,

  bP,
  bp: bP,
  p: bP,

  bR,
  br: bR,
  r: bR,

  bN,
  bn: bN,
  n: bN,

  bB,
  bb: bB,
  b: bB,

  bQ,
  bq: bQ,
  q: bQ,

  bK,
  bk: bK,
  k: bK,
};

const renderIcon: RenderNode = (renderers, flat, idx, props) => {
  const node = flat.nodes[idx] as any;
  const {emoji} = node;
  const fallback = <code>:{emoji}:</code>;
  const icon = icons[emoji as unknown as keyof typeof icons];

  let element = icon || <EmojiInlineLazy source={emoji} fallback={fallback} />;

  // Increase emoji 2x if document only contains emojis.
  if (props.scaleUpEmojiSrc) {
    const isSingleIconNodeParagraphDocument = flat.nodes.length === 3;
    if (isSingleIconNodeParagraphDocument) {
      element = <span style={{fontSize: '2em', lineHeight: '1.1em'}}>{element}</span>;
    }
  }

  return element;
};

export default renderIcon;
