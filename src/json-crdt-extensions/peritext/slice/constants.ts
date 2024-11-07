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

/**
 * Built-in slice types.
 */
export enum CommonSliceType {
  // Block slices
  p = 0,  // <p>
  blockquote = 1,  // <blockquote>
  codeblock = 2,  // <pre><code>
  pre = 3,  // <pre>
  ul = 4,  // <ul>
  ol = 5,  // <ol>
  TaskList = 6,  // - [ ] Task list
  h1 = 7, // <h1>
  h2 = 8, // <h2>
  h3 = 9, // <h3>
  h4 = 10, // <h4>
  h5 = 11, // <h5>
  h6 = 12, // <h6>
  title = 13, // <title>
  subtitle = 14, // <subtitle>
  br = 15, // <br>
  nl = 16, // \n
  hr = 17, // <hr>
  page = 18, // Page break
  aside = 19,  // <aside>
  embed = 20,  // <embed>, <iframe>, <object>, <video>, <audio>, etc.

  // Inline slices
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
  math = -15, // <math>
  font = -16, // <span style="font-family: ...">
  col = -17, // <span style="color: ...">
  bg = -18, // <span style="background: ...">
  hidden = -19, // <span style="color: transparent; background: black">
  footnote = -20, // <sup> or <a> with href="#footnote-..." and title="Footnote ..."
  ref = -21, // <a> with href="#ref-..." and title="Reference ..."
  iaside = -22, // Inline <aside>
  iembed = -23, // inline embed (any media, dropdown, Google Docs-like chips: date, person, file, etc.)
  bookmark = -24, // UI for creating a link to this slice
}

export enum SliceHeaderMask {
  X1Anchor = 0b1,
  X2Anchor = 0b10,
  Behavior = 0b11100,
}

export enum SliceHeaderShift {
  X1Anchor = 0,
  X2Anchor = 1,
  Behavior = 2,
}

export enum SliceBehavior {
  /**
   * A Split slice, which is used to mark a block split position in the document.
   * For example, paragraph, heading, blockquote, etc.
   */
  Marker = 0b000,

  /**
   * Appends attributes to a stack of attributes for a specific slice type. This
   * is useful when the same slice type can have multiple attributes, like
   * inline comments, highlights, etc.
   */
  Stack = 0b001,

  /**
   * Overwrites the stack of attributes for a specific slice type. Could be used
   * for simple inline formatting, like bold, italic, etc.
   */
  Overwrite = 0b010,

  /**
   * Removes all attributes for a specific slice type. For example, could be
   * used to reverse inline formatting, like bold, italic, etc.
   */
  Erase = 0b011,

  /**
   * Used to mark the user's cursor position in the document.
   *
   * @todo Consider removing this.
   */
  Cursor = 0b100,
}

export enum SliceBehaviorName {
  Marker = SliceBehavior.Marker,
  Stack = SliceBehavior.Stack,
  Overwrite = SliceBehavior.Overwrite,
  Erase = SliceBehavior.Erase,
  Cursor = SliceBehavior.Cursor,
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
