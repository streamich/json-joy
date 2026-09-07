export const enum TREE {
  /** Default fixed row height in px. */
  RowHeight = 26,
  /** Default indent step per depth level, in px. */
  Indent = 16,
  /** Default viewport height in px. */
  Height = 320,
  /** Default rows rendered above/below the visible window. */
  Overscan = 12,
  /** Default cap on stacked sticky-ancestor rows (keeps the deepest this many). */
  StickyMax = 5,
  /** Type-ahead buffer reset window, in ms. */
  TypeAheadTimeout = 600,
  /** How long the jump-to flash highlight stays, in ms. */
  FlashDuration = 1200,
  /** Chevron column width, in px. */
  ChevronSize = 16,
  /** Rendered icon size (height), in px. */
  IconSize = 16,
  /**
   * Fixed icon-column width, in px. Must be ≥ the widest default icon (DirIcon is
   * ~1.2× tall = 19px at IconSize 16) so the narrower FileIcon (~0.8× = 13px) and
   * the wider DirIcon both center on the same axis and names start at one offset.
   */
  IconCol = 20,
}

/** Stable DOM id for a row, used by `aria-activedescendant`. */
export const rowDomId = (treeId: string, nodeId: string): string => `${treeId}-${nodeId}`;
