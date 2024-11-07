import * as React from 'react';
import {put} from 'nano-theme';
import {CssClass, ElementAttr} from '../constants';
import {usePeritext} from './context';
import {CaretView} from './selection/CaretView';
import {FocusView} from './selection/FocusView';
import {AnchorView} from './selection/AnchorView';
import {InlineAttrEnd, InlineAttrStart, type Inline} from '../../json-crdt-extensions/peritext/block/Inline';
import {CommonSliceType} from '../../json-crdt-extensions';
import type {SpanProps} from './types';

const {createElement: h, Fragment} = React;

put('.' + CssClass.Inline, {
  /**
   * Font *kerning* is the variable distance between every pair of characters.
   * It is adjusted to make the text more readable. This disables it, so that
   * there is always the same distance between characters.
   *
   * Useful because, while moving the cursor the characters can be arbitrarily
   * grouped into <span> elements, the distance between them should be
   * consistent to avoid layout shifts. Otherwise, there is a text shift when
   * moving the cursor. For example, consider:
   *
   * ```jsx
   * <span>Word</span>
   * ```
   *
   * vs.
   *
   * ```jsx
   * <span>W</span><span>ord</span>
   * ```
   *
   * The kerning between letters "W" and "o" changes and results in a shift, if
   * this property is not set.
   */
  fontKerning: 'none',

  /**
   * Similar to `fontKerning`, but for ligatures. Ligatures are special glyphs
   * that combine two or more characters into a single glyph. We disable them
   * so that the text is more visually predictable.
   */
  fontVariantLigatures: 'none',
});

export interface InlineViewProps {
  inline: Inline;
}

/** @todo Add ability to compute `.hash` for {@link Inline} nodes and use for memoization. */
export const InlineView: React.FC<InlineViewProps> = (props) => {
  const {inline} = props;
  const ctx = usePeritext();
  const {renderers} = ctx;
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const text = inline.text();

  const span = ref.current;
  if (span) (span as any)[ElementAttr.InlineOffset] = inline;

  let attr: SpanProps = {
    className: CssClass.Inline,
    ref: (span: HTMLSpanElement | null) => {
      ref.current = span as HTMLSpanElement;
      if (span) (span as any)[ElementAttr.InlineOffset] = inline;
    },
  };
  for (const map of renderers) attr = map.text?.(attr, inline, ctx) ?? attr;
  let children: React.ReactNode = <span {...attr}>{text}</span>;
  for (const map of renderers) children = map.inline?.(props, children) ?? children;

  if (inline.hasCursor()) {
    const elements: React.ReactNode[] = [];
    const attr = inline.attr();
    const italic = attr[CommonSliceType.i] && attr[CommonSliceType.i][0];
    const key = inline.key();
    const cursorStart = inline.cursorStart();
    if (cursorStart) {
      const k = key + 'a';
      elements.push(
        cursorStart.isStartFocused() ? (
          cursorStart.isCollapsed() ? (
            <CaretView key={k} italic={!!italic} />
          ) : (
            <FocusView key={k} italic={italic instanceof InlineAttrEnd} />
          )
        ) : (
          <AnchorView key={k} />
        ),
      );
    }
    elements.push(h(Fragment, {key}, children));
    const cursorEnd = inline.cursorEnd();
    if (cursorEnd) {
      const k = key + 'b';
      elements.push(
        cursorEnd.isEndFocused() ? (
          cursorEnd.isCollapsed() ? (
            <CaretView key={k} italic={!!italic} />
          ) : (
            <FocusView key={k} left italic={italic instanceof InlineAttrStart} />
          )
        ) : (
          <AnchorView key={k} />
        ),
      );
    }
    children = h(Fragment, null, elements);
  }

  return children;
};
