import type * as React from 'react';
import type {MenuItem} from '../../4-card/StructuralMenu/types';
import type {GridState} from './state';

/** Built-in column value types; each supplies a default comparator, cell renderer, and alignment. */
export type GridColumnType = 'text' | 'number' | 'bool' | 'date';

export type GridAlign = 'left' | 'center' | 'right';

export type GridSortDir = 'asc' | 'desc';

/** One entry of the (possibly multi-column) sort order. */
export interface GridSortSpec {
  /** Column id. */
  column: string;
  dir: GridSortDir;
}

/** Everything a custom cell renderer receives. */
export interface GridCellCtx<R = unknown, V = any> {
  value: V;
  data: R;
  row: GridRowModel<R>;
  column: GridColumn<R, V>;
}

/**
 * A column descriptor — what the caller (or an adapter) passes. A plain object;
 * the {@link GridColumnType} supplies sensible defaults so callers usually pass
 * only a couple of fields.
 */
export interface GridColumnDef<R = unknown, V = any> {
  /** Stable column identity; doubles as the default accessor property key. */
  id: string;
  /** Header label. Defaults to the column id. */
  header?: React.ReactNode;
  /** Extracts the cell value from a data row. Defaults to reading `data[id]`. */
  accessor?: (data: R) => V;
  /** Value type — picks the default comparator, renderer, and alignment. Default `'text'`. */
  type?: GridColumnType;
  /** Column width in px. Default {@link GRID.ColWidth}. */
  width?: number;
  /** Lower bound the width is clamped to. Default {@link GRID.MinColWidth}. */
  minWidth?: number;
  /** Upper bound the width is clamped to (drag and auto-fit). Unbounded when omitted. */
  maxWidth?: number;
  /** Grow factor distributing leftover viewport width. Default 0 (fixed width). */
  flex?: number;
  align?: GridAlign;
  /** Whether header click sorts by this column. Default `true`. */
  sortable?: boolean;
  /** Whether the user can resize this column. Default `true`. */
  resizable?: boolean;
  /** Custom comparator; otherwise the type default. Never sees nullish values. */
  compare?: (a: V, b: V) => number;
  /** Custom cell renderer; otherwise the type default. */
  renderCell?: (ctx: GridCellCtx<R, V>) => React.ReactNode;
  /** Icon rendered in the header cell before the label. */
  icon?: React.ReactNode;
  /**
   * A specialized (non-content) column — selection checkbox, row icon, row
   * actions. Vertical gridlines never separate specialized columns from their
   * neighbors, and their cells are not focusable as active cells.
   */
  special?: boolean;
  /** Opaque caller payload (e.g. the adapter's source descriptor). */
  meta?: unknown;
}

/**
 * A resolved runtime column — the output of the column pipeline
 * (order, then visibility, then size), with all defaults applied.
 */
export interface GridColumn<R = unknown, V = any> {
  def: GridColumnDef<R, V>;
  id: string;
  /** Position among the visible columns. */
  index: number;
  type: GridColumnType;
  width: number;
  minWidth: number;
  maxWidth?: number;
  flex: number;
  align: GridAlign;
  sortable: boolean;
  resizable: boolean;
  /** See {@link GridColumnDef.special}. */
  special: boolean;
  /** Whether a vertical gridline is drawn at this column's right edge. */
  divider: boolean;
  getValue: (data: R) => V;
  compare: (a: V, b: V) => number;
}

/**
 * One visible row — the output of the row pipeline. Flat and windowable; later
 * stages extend this shape with group and tree rows.
 */
export interface GridRowModel<R = unknown> {
  id: string;
  data: R;
  /** Position in the flat visible list. */
  index: number;
}

/** Column width overrides keyed by column id, as a `Map` or a JSON-friendly record. */
export type GridColumnSizingInput = ReadonlyMap<string, number> | Readonly<Record<string, number>>;

export type GridSelectionMode = 'none' | 'single' | 'multi';

/**
 * Anchor of the floating selection toolbar. `top` (the default) floats
 * centered just below the sticky header; the `bottom` anchors float over the
 * lower edge of the rows. `top-left` and `top-right` sit just OUTSIDE the
 * table, above its top edge, so they never overlay rows.
 */
export type GridSelectionMenuPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';

/**
 * Builds the header context menu for a column: receives the column, the
 * pre-built default items (sort / auto-fit / reset width), and the total
 * table state; returns the final items.
 */
export type GridHeaderMenuBuilder<R = unknown> = (
  column: GridColumn<R>,
  menu: MenuItem[],
  state: GridState<R>,
) => MenuItem[];

/**
 * Builds the in-cell hover menu for one cell: receives the cell coordinate,
 * its column and row, the rendered cell element, and the total table state;
 * returns the toolbar items. Return an empty array to show nothing for that
 * cell.
 */
export type GridCellMenuBuilder<R = unknown> = (
  cell: GridCellCoord,
  column: GridColumn<R>,
  row: GridRowModel<R>,
  el: HTMLElement | null,
  state: GridState<R>,
) => MenuItem[];

/** Resolved gridline flags: header verticals, body verticals, row separators. */
export interface GridGridlines {
  header: boolean;
  columns: boolean;
  rows: boolean;
}

/**
 * Gridlines switch: `true` draws everything; an object turns gridlines on with
 * per-part overrides (a missing field means on), e.g. `{header: false}` keeps
 * body gridlines but drops the vertical separators between header cells.
 */
export type GridlinesInput = boolean | Partial<GridGridlines>;

/** How a `select()` call combines with the current selection. */
export type GridSelectMode = 'replace' | 'toggle' | 'range';

/** Address of one cell, by ids — survives sorting and column reorder. */
export interface GridCellCoord {
  /** Row id (see {@link GridStateOpts.getId}). */
  row: string;
  /** Column id. */
  col: string;
}

export interface GridEventHandlers<R = unknown> {
  onSortingChange?: (sorting: readonly GridSortSpec[]) => void;
  /** Fired when a resize commits (pointer up / key press), not per drag frame. */
  onColumnSizingChange?: (sizing: ReadonlyMap<string, number>) => void;
  onRowClick?: (row: GridRowModel<R>, e: React.MouseEvent, state: GridState<R>) => void;
  onSelectionChange?: (selected: ReadonlySet<string>, state: GridState<R>) => void;
  onActiveCellChange?: (cell: GridCellCoord | null, state: GridState<R>) => void;
  /**
   * Called when a cell is about to become the active cell. Return the literal
   * `false` to veto — the cell is then not focusable/selectable and keyboard
   * navigation skips over it.
   */
  onCellFocus?: (
    cell: GridCellCoord,
    column: GridColumn<R>,
    row: GridRowModel<R>,
    state: GridState<R>,
  ) => void | boolean;
  /**
   * The cell's "enter" action — fired by Enter on the active cell and by
   * double-click. `el` is the rendered cell element (anchor a `Popup` with info
   * or edit controls on it), or `null` when the row is outside the virtual
   * window.
   */
  onCellAction?: (
    cell: GridCellCoord,
    column: GridColumn<R>,
    row: GridRowModel<R>,
    el: HTMLElement | null,
    state: GridState<R>,
  ) => void;
}

/** Options for the headless {@link GridState} constructor. */
export interface GridStateOpts<R = unknown> extends GridEventHandlers<R> {
  data: readonly R[];
  columns: readonly GridColumnDef<R>[];
  /**
   * Stable row identity, used for React keys and (later) selection. Defaults to
   * the row's index in `data`, which breaks row identity across data mutations —
   * pass a real id when rows can change.
   */
  getId?: (data: R, index: number) => string;
  sorting?: readonly GridSortSpec[];
  columnSizing?: GridColumnSizingInput;
  /** Master switch for user column resizing. Default `true`. */
  resizableColumns?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  /** Row and column hairlines; see {@link GridlinesInput}. Default `false`. */
  gridlines?: GridlinesInput;
  /** Tint every other row. Default `false`. */
  zebra?: boolean;
  /**
   * Spacing (density) in the `[0.0, 1.0]` range — higher is roomier. Maps to
   * horizontal cell padding; `0.5` (the default) is the standard 8px.
   */
  spacing?: number;
  /** Row icon renderer, used by the icon column (see {@link GridStateOpts.iconColumn}). */
  icon?: (data: R, row: GridRowModel<R>) => React.ReactNode;
  /**
   * Prepend the row-icon column. Combined with {@link GridStateOpts.selectionColumn}
   * the two join into one leading column: the icon at rest, the checkbox when
   * the row is hovered or selected.
   */
  iconColumn?: boolean;
  /**
   * Mute the selection checkboxes: a row check shows only when the row is
   * hovered or selected; the header check only when hovered or the selection
   * is non-empty. Implied by the joined icon + selection column.
   */
  muteSelection?: boolean;

  // Selection.
  /** Row selection mode. Default `'none'`. */
  selection?: GridSelectionMode;
  /** Initially selected row ids. */
  selected?: Iterable<string>;
  /** Upper bound on how many rows can be selected (multi mode). Unbounded when omitted. */
  maxSelected?: number;
  /** Prepend the checkbox selection column. Default `false`. */
  selectionColumn?: boolean;
  /** Whether clicking a row body selects it. Default `true`; disable to select only through the checkbox column. */
  selectOnRowClick?: boolean;
  /** Initially active cell. */
  activeCell?: GridCellCoord | null;
}

export interface GridProps<R = unknown> extends GridEventHandlers<R> {
  /** Row data. */
  data: readonly R[];
  /** Column descriptors (or built by an adapter). */
  columns: readonly GridColumnDef<R>[];
  /** Stable row identity; see {@link GridStateOpts.getId}. */
  getId?: (data: R, index: number) => string;
  /** Bring-your-own headless state; created internally when omitted. */
  state?: GridState<R>;

  // Sorting — controlled OR uncontrolled.
  sorting?: readonly GridSortSpec[];
  defaultSorting?: readonly GridSortSpec[];

  // Column sizing — controlled OR uncontrolled.
  columnSizing?: GridColumnSizingInput;
  defaultColumnSizing?: GridColumnSizingInput;
  /** Master switch for user column resizing. Default `true`. */
  resizableColumns?: boolean;

  // Selection — controlled OR uncontrolled.
  /** Row selection mode. Default `'none'`. */
  selection?: GridSelectionMode;
  selected?: Iterable<string>;
  defaultSelected?: Iterable<string>;
  /** Upper bound on how many rows can be selected (multi mode). Unbounded when omitted. */
  maxSelected?: number;
  /** Prepend the checkbox selection column. Default `false`. */
  selectionColumn?: boolean;
  /** Whether clicking a row body selects it. Default `true`. */
  selectOnRowClick?: boolean;
  /** Show selected rows as marks on the scroll rail. Default `true` when selection is on. */
  selectionMarkers?: boolean;
  /** Rail mark color. Defaults to the theme accent (the checkbox color). */
  selectionMarkerColor?: string;

  // Active cell — controlled OR uncontrolled.
  activeCell?: GridCellCoord | null;
  defaultActiveCell?: GridCellCoord;

  /** Fixed row height in px (the O(1) virtualizer fast path). Default 28. */
  rowHeight?: number;
  /** Header row height in px. Default 28. */
  headerHeight?: number;
  /** Viewport height. Default 360. */
  height?: number | string;
  /** Extra rows rendered above/below the window. Default 12. */
  overscan?: number;

  /** Row and column hairlines; see {@link GridlinesInput}. Default `false`. */
  gridlines?: GridlinesInput;
  zebra?: boolean;
  /**
   * Spacing (density) in the `[0.0, 1.0]` range — higher is roomier; `0.5` is
   * the default. An ancestor `spacing` trace takes precedence.
   */
  spacing?: number;
  /** Draw a rounded hairline border around the grid. Default `false`. */
  frame?: boolean;
  /** Row icon renderer for the icon column. */
  icon?: (data: R, row: GridRowModel<R>) => React.ReactNode;
  /** Prepend the row-icon column; joins with the checkbox column when both are on. */
  iconColumn?: boolean;
  /** Show selection checkboxes only on hover / when selected. */
  muteSelection?: boolean;
  /**
   * Opt-in floating selection toolbar: actions rendered as a `ToolbarMenu`
   * hovering over the table whenever rows are selected, next to the
   * selected-row count. Called with the grid state, so actions consume the
   * live selection directly — `state.selected.value` inside an `onSelect` is
   * the selected row ids (the toolbar clears the selection only after the
   * action runs); map ids to rows through `state.rowIndexById.value` and
   * `state.rows.value`.
   */
  selectionMenu?: (state: GridState<R>) => MenuItem[];
  /** Where the floating selection toolbar anchors. Default `'top'` (centered, below the header). */
  selectionMenuPosition?: GridSelectionMenuPosition;
  /**
   * Header-click context menu mode: instead of immediately toggling the sort,
   * clicking a header opens a `ContextMenu` popup anchored to the cell.
   * `true` shows the built-in column items (sort ascending/descending, clear
   * sort, auto-fit width, reset width); a builder receives the column, the
   * pre-built default items, and the total table state, and returns the final
   * items — splice, extend, or replace.
   */
  headerMenu?: boolean | GridHeaderMenuBuilder<R>;
  /**
   * In-cell hover menu: while a body cell is hovered, the builder's items
   * render as a compact floating toolbar pill at the cell's right edge —
   * return an empty array to show nothing for that cell. Runs per hovered
   * cell with the total table state; specialized columns never get it.
   */
  cellMenu?: GridCellMenuBuilder<R>;
  /** Shown when there are no rows. Default `'No rows'`. */
  emptyText?: React.ReactNode;

  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}
