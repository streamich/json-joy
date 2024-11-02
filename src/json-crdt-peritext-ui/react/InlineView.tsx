import * as React from 'react';
import type {Inline} from '../../json-crdt-extensions/peritext/block/Inline';
import {CssClass, ElementAttr} from '../constants';
import {TextView} from './TextView';
import {usePeritext} from './context';
import {CaretView} from './selection/CaretView';
import {FocusView} from './selection/FocusView';
import {AnchorView} from './selection/AnchorView';
import {put} from 'nano-theme';

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
  const {renderers} = usePeritext();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const text = inline.text();

  const span = ref.current;
  if (span) (span as any)[ElementAttr.InlineOffset] = inline;

  const attributes: React.HTMLAttributes<HTMLSpanElement> = {
    className: CssClass.Inline,
  };

  let children: React.ReactNode = (
    <TextView
      ref={(span: HTMLSpanElement | null) => {
        ref.current = span as HTMLSpanElement;
        if (span) (span as any)[ElementAttr.InlineOffset] = inline;
      }}
      attr={attributes}
      text={text}
    />
  );
  for (const map of renderers) children = map.inline?.(props, children, attributes) ?? children;

  if (inline.hasCursor()) {
    const elements: React.ReactNode[] = [];
    const attr = inline.attr();
    const key = inline.key();
    const cursorStart = inline.cursorStart();
    if (cursorStart) {
      const k = key + 'a';
      elements.push(
        cursorStart.isStartFocused() ? (
          cursorStart.isCollapsed() ? (
            <CaretView key={k} italic={!!attr.i} />
          ) : (
            <FocusView key={k} />
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
            <CaretView key={k} italic={!!attr.i} />
          ) : (
            <FocusView key={k} left />
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
