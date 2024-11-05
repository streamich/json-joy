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
  Cursor = -1,

  // Block slices
  Paragraph = 0,
  Title = 1,
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
  H5 = 5,
  H6 = 6,
  BlockQuote = 7,
  CodeBlock = 8,
  Preformatted = 9,
  OrderedList = 10,
  UnorderedList = 11,
  TaskList = 12,
  ListItem = 13,
  LineBreak = 14,
  NewLine = 15,
  PageBreak = 16,
  Aside = 17,

  // Inline slices
  Bold = -2,
  Italic = -3,
  Underline = -4,
  Strikethrough = -5,
  Code = -6,
  Highlight = -7,
  Link = -8,
  Comment = -9,
  Superscript = -10,
  Subscript = -11,
  Math = -12,
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
