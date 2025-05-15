/**
 * Specifies whether the start or the end of the cursor is the "anchor", e.g.
 * the end which does not move when user changes selection. The other
 * end is free to move, the moving end of the cursor is "focus". By default
 * "anchor" is usually the start of the cursor.
 */
export enum CursorAnchor {
  Start = 0,
  End = 1,
}

export const enum SliceTypeCon {
  // ---------------------------------------------------- block slices (0 to 64)
  p = 0, // <p>
  blockquote = 1, // <blockquote>
  codeblock = 2, // <pre><code>
  pre = 3, // <pre>
  ul = 4, // <ul>
  ol = 5, // <ol>
  tl = 6, // - [ ] Task list
  li = 7, // <li>
  h1 = 8, // <h1>
  h2 = 9, // <h2>
  h3 = 10, // <h3>
  h4 = 11, // <h4>
  h5 = 12, // <h5>
  h6 = 13, // <h6>
  title = 14, // <title>
  subtitle = 15, // <subtitle>
  br = 16, // <br>
  nl = 17, // \n
  hr = 18, // <hr>
  page = 19, // Page break
  aside = 20, // <aside>
  embed = 21, // <embed>, <iframe>, <object>, <video>, <audio>, etc.
  column = 22, // <div style="column-count: ..."> (represents 2 and 3 column layouts)
  contents = 23, // Table of contents
  table = 24, // <table>
  row = 25, // Table row
  cell = 26, // Table cell

  // TODO: rename to `cl` (collapsible list)?
  collapselist = 27, // Collapsible list - > List item

  collapse = 28, // Collapsible block
  note = 29, // Note block
  mathblock = 30, // <math> block

  // ------------------------------------------------ inline slices (-64 to -1)
  Cursor = -1,
  RemoteCursor = -2,
  b = -3, // <b>
  i = -4, // <i>
  u = -5, // <u>
  s = -6, // <s>
  code = -7, // <code>
  mark = -8, // <mark>
  a = -9, // <a>
  comment = -10, // User comment attached to a slice
  del = -11, // <del>
  ins = -12, // <ins>
  sup = -13, // <sup>
  sub = -14, // <sub>
  math = -15, // <math> inline
  font = -16, // <span style="font-family: ...">
  col = -17, // <span style="color: ...">
  bg = -18, // <span style="background: ...">
  kbd = -19, // <kbd>
  spoiler = -20, // <span style="color: transparent; background: black">
  q = -21, // <q> (inline quote)
  cite = -22, // <cite> (inline citation)
  footnote = -23, // <sup> or <a> with href="#footnote-..." and title="Footnote ..."
  ref = -24, // <a> with href="#ref-..." and title="Reference ..." (Reference to some element in the document)
  iaside = -25, // Inline <aside>
  iembed = -26, // inline embed (any media, dropdown, Google Docs-like chips: date, person, file, etc.)
  bookmark = -27, // UI for creating a link to this slice
  overline = -28, // <span style="text-decoration: overline">
}

/**
 * All type name must be fully lowercase, as HTML custom element tag names must
 * be lowercase.
 */
export enum SliceTypeName {
  p = SliceTypeCon.p,
  blockquote = SliceTypeCon.blockquote,
  codeblock = SliceTypeCon.codeblock,
  pre = SliceTypeCon.pre,
  ul = SliceTypeCon.ul,
  ol = SliceTypeCon.ol,
  tl = SliceTypeCon.tl,
  li = SliceTypeCon.li,
  h1 = SliceTypeCon.h1,
  h2 = SliceTypeCon.h2,
  h3 = SliceTypeCon.h3,
  h4 = SliceTypeCon.h4,
  h5 = SliceTypeCon.h5,
  h6 = SliceTypeCon.h6,
  title = SliceTypeCon.title,
  subtitle = SliceTypeCon.subtitle,
  br = SliceTypeCon.br,
  nl = SliceTypeCon.nl,
  hr = SliceTypeCon.hr,
  page = SliceTypeCon.page,
  aside = SliceTypeCon.aside,
  embed = SliceTypeCon.embed,
  column = SliceTypeCon.column,
  contents = SliceTypeCon.contents,
  table = SliceTypeCon.table,
  row = SliceTypeCon.row,
  cell = SliceTypeCon.cell,
  collapselist = SliceTypeCon.collapselist,
  collapse = SliceTypeCon.collapse,
  note = SliceTypeCon.note,
  mathblock = SliceTypeCon.mathblock,

  Cursor = SliceTypeCon.Cursor,
  RemoteCursor = SliceTypeCon.RemoteCursor,
  b = SliceTypeCon.b,
  i = SliceTypeCon.i,
  u = SliceTypeCon.u,
  s = SliceTypeCon.s,
  code = SliceTypeCon.code,
  mark = SliceTypeCon.mark,
  a = SliceTypeCon.a,
  comment = SliceTypeCon.comment,
  del = SliceTypeCon.del,
  ins = SliceTypeCon.ins,
  sup = SliceTypeCon.sup,
  sub = SliceTypeCon.sub,
  math = SliceTypeCon.math,
  font = SliceTypeCon.font,
  col = SliceTypeCon.col,
  bg = SliceTypeCon.bg,
  kbd = SliceTypeCon.kbd,
  spoiler = SliceTypeCon.spoiler,
  footnote = SliceTypeCon.footnote,
  ref = SliceTypeCon.ref,
  iaside = SliceTypeCon.iaside,
  iembed = SliceTypeCon.iembed,
  bookmark = SliceTypeCon.bookmark,
  overline = SliceTypeCon.overline,
}

/** Slice header octet (8 bits) masking specification. */
export enum SliceHeaderMask {
  /** The {@link Anchor} of the slice start {@link Point}.  */
  X1Anchor = 0b00000001,
  /** The {@link Anchor} of the slice end {@link Point}.  */
  X2Anchor = 0b00000010,
  /** Slice stacking behavior, one of {@link SliceStacking}. */
  Stacking = 0b00011100,
}

export enum SliceHeaderShift {
  X1Anchor = 0,
  X2Anchor = 0 + 1,
  Stacking = 0 + 1 + 1,
}

export enum SliceStacking {
  /**
   * The `Marker` slices are used to mark a block split position in the
   * document. For example, paragraph, heading, blockquote, etc. It separates
   * adjacent blocks and is used to determine the block type of the contents
   * following the marker, until the next marker is encountered.
   */
  Marker = 0b000,

  /**
   * The `Many` slices are inline formatting annotations, which allow one
   * or more annotations of the same type to apply to the same text. Slices with
   * stacking behavior `Many` are appended to the stack of attributes for a
   * specific slice type. With the most recent annotation on top.
   *
   * Slices with stacking behavior `Many` are used for inline formatting, like
   * for links, comments, etc. Where multiple annotations of the same type can
   * be applied to the same text.
   */
  Many = 0b001,

  /**
   * The slices with stacking behavior `One` are used for inline formatting
   * annotations, they overwrite the stack of attributes for a specific slice
   * type. This type of slice is used when only one annotation of a specific
   * type can be applied to the same text. For example, those could be used
   * for simple inline formatting, like bold, italic, etc.
   */
  One = 0b010,

  /**
   * The `Erase` slices are used to soft remove all annotations
   * (`Many` or `One`) of the same type which are applied to the same text
   * range. The erase slices soft remove only the annotations which were applied
   * before the erase slice, as determined by the logical clock (there could
   * be many layers of annotations applied and erased).
   *
   * Usually slices with stacking behavior `Erase` are used to reverse inline
   * exclusive (`One`) inline formatting, like bold, italic, etc.
   */
  Erase = 0b011,

  /**
   * Used to mark the user's cursor position in the document.
   *
   * @todo Consider removing this.
   */
  Cursor = 0b100,
}

export enum SliceStackingName {
  Marker = SliceStacking.Marker,
  Many = SliceStacking.Many,
  One = SliceStacking.One,
  Erase = SliceStacking.Erase,
  Cursor = SliceStacking.Cursor,
}

/**
 * Specifies `vec` offsets in the {@link SliceView}.
 */
export enum SliceTupleIndex {
  Header = 0,
  X1 = 1,
  X2 = 2,
  Type = 3,
  Data = 4,
}
