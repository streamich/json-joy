export const enum GRID {
  /** Default fixed row height in px. */
  RowHeight = 28,
  /** Default header row height in px. */
  HeaderHeight = 28,
  /** Default viewport height in px. */
  Height = 360,
  /** Default rows rendered above/below the visible window. */
  Overscan = 12,
  /** Default column width in px. */
  ColWidth = 120,
  /** Default lower bound a column width is clamped to, in px. */
  MinColWidth = 40,
  /** Horizontal cell padding in px (the `spacing = 0.5` default). */
  CellPad = 8,
  /** Cell padding at `spacing = 1.0`, in px; padding scales linearly from 0. */
  SpacingMaxPad = 16,
  /** Sort indicator size in px. */
  SortIconSize = 14,
  /** Flex gap between header-cell children, in px (also used by auto-fit measurement). */
  HeaderGap = 4,
  /** Resize-handle hit-area width, in px. */
  ResizeHitArea = 10,
  /** Keyboard resize step, in px. */
  ResizeStep = 10,
  /** Keyboard resize step with Shift held, in px. */
  ResizeLargeStep = 50,
  /** Checkbox selection column width, in px. */
  SelectColWidth = 32,
  /** Selection checkbox size, in px — matches the row-icon size. */
  SelectCheckSize = 16,
  /** Row-icon column width, in px. */
  IconColWidth = 28,
  /** Rail-map granularity: selected rows bucket into this many mark slots. */
  MarkerResolution = 200,
  /** Gap between the cell-menu pill and the cell's right edge, in px. */
  CellMenuInset = 4,
}

/** Reserved id of the synthetic checkbox selection column. */
export const GRID_SELECT_COL = '__select__';

/** Reserved id of the synthetic row-icon column. */
export const GRID_ICON_COL = '__icon__';
