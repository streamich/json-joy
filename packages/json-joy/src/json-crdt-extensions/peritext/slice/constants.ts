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

// biome-ignore format: keep table layout
export const enum SliceTypeCon {
  // ------------------------ block slices (positive integers, starting from 0)
  p                 = 0,                      // <p>
  blockquote        = 1 + p,                  // <blockquote> (used by Quill)
  codeblock         = 1 + blockquote,         // <code>
  'code-block'      = 1 + codeblock,          // <code> (same as <codeblock>, used by Quill)
  code_block        = 2 + codeblock,          // <code> (same as <codeblock>, used by Prosemirror)
  pre               = 1 + code_block,         // <pre>
  ul                = 1 + pre,                // <ul>
  ol                = 1 + ul,                 // <ol>
  tl                = 1 + ol,                 // - [ ] Task list
  li                = 1 + tl,                 // <li>
  list              = 1 + li,                 // A generic list (used by Quill)
  h1                = 1 + list,               // <h1>
  h2                = 1 + h1,                 // <h2>
  h3                = 1 + h2,                 // <h3>
  h4                = 1 + h3,                 // <h4>
  h5                = 1 + h4,                 // <h5>
  h6                = 1 + h5,                 // <h6>
  heading           = 1 + h6,                 // <heading level="3"> (same as <h3>)
  header            = 1 + heading,            // <header level="3"> (same as <h3>, used by Quill)
  title             = 1 + header,             // <title> (whole document title)
  subtitle          = 1 + title,              // <subtitle> (whole document subtitle)
  br                = 1 + subtitle,           // <br>
  hard_break        = 1 + br,                 // Same as <br> (used by Prosemirror)
  nl                = 1 + hard_break,         // \n
  hr                = 1 + nl,                 // <hr>
  horizontal_rule   = 1 + hr,                 // Same as <hr> (used by Prosemirror)
  page              = 1 + horizontal_rule,    // Page break
  aside             = 1 + page,               // <aside>
  imgblock          = 1 + aside,              // <img> (image)
  embed             = 1 + imgblock,           // <embed>, <iframe>, <object>, <video>, <audio>, etc.
  column            = 1 + embed,              // <div style="column-count: ...">
  contents          = 1 + column,             // Table of contents
  table             = 1 + contents,           // <table>
  tr                = 1 + table,              // <tr> (table row)
  td                = 1 + tr,                 // <td> (table cell)
  cl                = 1 + td,                 // Collapsible list
  collapse          = 1 + cl,                 // Collapsible block
  note              = 1 + collapse,           // Note block
  mathblock         = 1 + note,               // <math> block
  div               = 1 + mathblock,          // <div>

  // ---------------------- inline slices (negative integers, starting from -1)
  Cursor            = -1,                     // Current user's cursors.
  RemoteCursor      = -1 + Cursor,            // Remote collaborator cursors.
  b                 = -1 + RemoteCursor,      // <b>
  bold              = -1 + b,                 // <bold> (same as <b>, used in Slate and Quill)
  strong            = -1 + bold,              // <strong> (similar to <b>, used in Prosemirror)
  i                 = -1 + strong,            // <i>
  italic            = -1 + i,                 // <em> (same as <i>, used in Slate and Quill)
  em                = -1 + italic,            // <em> (similar to <i>, used in Prosemirror)
  u                 = -1 + em,                // <u>
  underline         = -1 + u,                 // <underline> (same as <u>, used in Slate and Quill)
  overline          = -1 + underline,         // <span style="text-decoration: overline">
  s                 = -1 + overline,          // <s>
  strike            = -1 + s,                 // <strike> (same as <s>, used by Quill)
  strikethrough     = -1 + strike,            // <strikethrough> (same as <s>)
  code              = -1 + strikethrough,     // <code>
  mark              = -1 + code,              // <mark>
  a                 = -1 + mark,              // <a>
  link              = -1 + a,                 // <link> (same as <a>, used in Prosemirror and Quill)
  img               = -1 + link,              // inline <img>
  image             = -1 + img,               // <image> (same as <img>, used in Quill)
  comment           = -1 + image,             // User comment attached to a slice
  del               = -1 + comment,           // <del>
  ins               = -1 + del,               // <ins>
  sup               = -1 + ins,               // <sup>
  sub               = -1 + sup,               // <sub>
  script            = -1 + sub,               // { script: 'sub' | 'sup' } (used in Quill)
  math              = -1 + script,            // <math> inline
  font              = -1 + math,              // <span style="font-family: ..."> (used in Quill)
  col               = -1 + font,              // <span style="color: ...">
  color             = -1 + col,               // Same as col, used by Quill
  bg                = -1 + color,             // <span style="background: ...">
  background        = -1 + bg,                // Same as bg, used by Quill
  kbd               = -1 + background,        // <kbd>
  spoiler           = -1 + kbd,               // <span style="color: transparent; background: black">
  q                 = -1 + spoiler,           // <q> (inline quote)
  cite              = -1 + q,                 // <cite> (inline citation)
  footnote          = -1 + cite,              // <sup> or <a> with href="#footnote-..." and title="Footnote ..."
  ref               = -1 + footnote,          // <a> with href="#ref-..." and title="Reference ..." (Reference to some element in the document)
  iaside            = -1 + ref,               // Inline <aside>
  iembed            = -1 + iaside,            // inline embed (any media, dropdown, Google Docs-like chips: date, person, file, etc.)
  bookmark          = -1 + iembed,            // UI for creating a link to this slice
}

/**
 * All type name must be fully lowercase, as HTML custom element tag names must
 * be lowercase.
 */
export enum SliceTypeName {
  p = SliceTypeCon.p,
  blockquote = SliceTypeCon.blockquote,
  codeblock = SliceTypeCon.codeblock,
  'code-block' = SliceTypeCon['code-block'],
  code_block = SliceTypeCon.code_block,
  pre = SliceTypeCon.pre,
  ul = SliceTypeCon.ul,
  ol = SliceTypeCon.ol,
  tl = SliceTypeCon.tl,
  li = SliceTypeCon.li,
  list = SliceTypeCon.list,
  h1 = SliceTypeCon.h1,
  h2 = SliceTypeCon.h2,
  h3 = SliceTypeCon.h3,
  h4 = SliceTypeCon.h4,
  h5 = SliceTypeCon.h5,
  h6 = SliceTypeCon.h6,
  heading = SliceTypeCon.heading,
  header = SliceTypeCon.header,
  title = SliceTypeCon.title,
  subtitle = SliceTypeCon.subtitle,
  br = SliceTypeCon.br,
  hard_break = SliceTypeCon.hard_break,
  nl = SliceTypeCon.nl,
  hr = SliceTypeCon.hr,
  horizontal_rule = SliceTypeCon.horizontal_rule,
  page = SliceTypeCon.page,
  aside = SliceTypeCon.aside,
  imgblock = SliceTypeCon.imgblock,
  embed = SliceTypeCon.embed,
  column = SliceTypeCon.column,
  contents = SliceTypeCon.contents,
  table = SliceTypeCon.table,
  tr = SliceTypeCon.tr,
  td = SliceTypeCon.td,
  cl = SliceTypeCon.cl,
  collapse = SliceTypeCon.collapse,
  note = SliceTypeCon.note,
  mathblock = SliceTypeCon.mathblock,
  div = SliceTypeCon.div,

  Cursor = SliceTypeCon.Cursor,
  RemoteCursor = SliceTypeCon.RemoteCursor,
  b = SliceTypeCon.b,
  bold = SliceTypeCon.bold,
  strong = SliceTypeCon.strong,
  i = SliceTypeCon.i,
  italic = SliceTypeCon.italic,
  em = SliceTypeCon.em,
  u = SliceTypeCon.u,
  underline = SliceTypeCon.underline,
  overline = SliceTypeCon.overline,
  s = SliceTypeCon.s,
  strike = SliceTypeCon.strike,
  strikethrough = SliceTypeCon.strikethrough,
  code = SliceTypeCon.code,
  mark = SliceTypeCon.mark,
  a = SliceTypeCon.a,
  link = SliceTypeCon.link,
  img = SliceTypeCon.img,
  image = SliceTypeCon.image,
  comment = SliceTypeCon.comment,
  del = SliceTypeCon.del,
  ins = SliceTypeCon.ins,
  sup = SliceTypeCon.sup,
  sub = SliceTypeCon.sub,
  script = SliceTypeCon.script,
  math = SliceTypeCon.math,
  font = SliceTypeCon.font,
  col = SliceTypeCon.col,
  color = SliceTypeCon.color,
  bg = SliceTypeCon.bg,
  background = SliceTypeCon.background,
  kbd = SliceTypeCon.kbd,
  spoiler = SliceTypeCon.spoiler,
  q = SliceTypeCon.q,
  cite = SliceTypeCon.cite,
  footnote = SliceTypeCon.footnote,
  ref = SliceTypeCon.ref,
  iaside = SliceTypeCon.iaside,
  iembed = SliceTypeCon.iembed,
  bookmark = SliceTypeCon.bookmark,
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
