/**
 * Specifies which cursor end is the "anchor", e.g. the end which does not move
 * when user changes selection.
 */
export const enum CursorAnchor {
  Start = 0,
  End = 1,
}

export const enum Tags {
  Cursor = 0,
}

export const enum SliceHeaderMask {
  X1Anchor = 0b1,
  X2Anchor = 0b10,
  Behavior = 0b11100,
}

export const enum SliceHeaderShift {
  X1Anchor = 0,
  X2Anchor = 1,
  Behavior = 2,
}

export const enum SliceBehavior {
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
   * used to re-verse inline formatting, like bold, italic, etc.
   */
  Erase = 0b011,
}

export const enum SliceTupleIndex {
  Header = 0,
  X1 = 1,
  X2 = 2,
  Type = 3,
  Data = 4,
}
