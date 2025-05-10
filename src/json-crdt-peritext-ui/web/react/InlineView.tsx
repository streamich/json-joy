import * as React from 'react';
import {put} from 'nano-theme';
import {CssClass, ElementAttr} from '../constants';
import {usePeritext} from './context';
import type {Inline} from '../../../json-crdt-extensions/peritext/block/Inline';
import type {SpanProps} from './types';

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

  /**
   * Hide the default system caret (and selection). Peritext renders its own
   * caret and selection, see `CaretView` component as example.
   *
   * The default Peritext caret and selection are invisible, but the plugins
   * can fully customize their appearance.
   */
  caretColor: 'transparent',
  '::selection': {
    bgc: 'transparent',
  },
});

export interface InlineViewProps {
  inline: Inline;
}

/** @todo Add ability to compute `.hash` for {@link Inline} nodes and use for memoization. */
export const InlineView: React.FC<InlineViewProps> = (props) => {
  const {inline} = props;
  const ctx = usePeritext();
  const {plugins, dom} = ctx;
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const text = inline.text();

  const span = ref.current;
  if (span) (span as any)[ElementAttr.InlineOffset] = inline;

  let attr: SpanProps = {
    className: CssClass.Inline,
    ref: (span: HTMLSpanElement | null) => {
      const inlines = dom.inlines;
      const start = inline.start;
      ref.current = span as HTMLSpanElement;
      if (span) {
        (span as any)[ElementAttr.InlineOffset] = inline;
        inlines.set(start, span);
      } else {
        inlines.del(start);
      }
    },
  };
  for (const map of plugins) attr = map.text?.(attr, inline, ctx) ?? attr;
  let children: React.ReactNode = <span {...attr}>{text}</span>;
  for (const map of plugins) children = map.inline?.(props, children) ?? children;
  return children;
};
