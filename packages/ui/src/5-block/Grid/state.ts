import type * as React from 'react';
import {ScrollState, type VirtualWindow} from '../../4-card/ScrollArea';
import type {UiLifeCycles} from '../../types';
import * as rsync from '../../utils/rsync';
import {announce, formatSizeForAnnouncement} from '../SplitPane/utils/accessibility';
import {columnType} from './columnTypes';
import {GRID, GRID_ICON_COL, GRID_SELECT_COL} from './constants';
import type {
  GridCellCoord,
  GridCellMenuBuilder,
  GridColumn,
  GridColumnDef,
  GridColumnSizingInput,
  GridGridlines,
  GridlinesInput,
  GridRowModel,
  GridSelectionMode,
  GridSelectMode,
  GridSortDir,
  GridSortSpec,
  GridStateOpts,
} from './types';

let counter = 0;

/** Normalize a `Map` or record of width overrides to a mutable `Map`. */
export const toSizingMap = (input?: GridColumnSizingInput): Map<string, number> =>
  input instanceof Map ? new Map(input) : new Map(Object.entries(input ?? {}));

/** Human-readable column name for ARIA labels and announcements. */
export const columnLabel = (column: GridColumn<any>): string =>
  typeof column.def.header === 'string' ? column.def.header : column.id;

interface RowComparator<R> {
  getValue: (data: R) => unknown;
  compare: (a: any, b: any) => number;
  mult: number;
}

const defaultAccessor =
  <R>(id: string) =>
  (data: R): unknown =>
    (data as Record<string, unknown>)[id];

/** Definition of the synthetic checkbox selection column. */
const selectColumnDef: GridColumnDef<any> = {
  id: GRID_SELECT_COL,
  header: '',
  width: GRID.SelectColWidth,
  minWidth: GRID.SelectColWidth,
  maxWidth: GRID.SelectColWidth,
  align: 'center',
  sortable: false,
  resizable: false,
  special: true,
  accessor: () => null,
};

/** Definition of the synthetic row-icon column. */
const iconColumnDef: GridColumnDef<any> = {
  id: GRID_ICON_COL,
  header: '',
  width: GRID.IconColWidth,
  minWidth: GRID.IconColWidth,
  maxWidth: GRID.IconColWidth,
  align: 'center',
  sortable: false,
  resizable: false,
  special: true,
  accessor: () => null,
};

/** Resolve the gridlines switch: an object means on, with per-part overrides. */
export const toGridlines = (input?: GridlinesInput): GridGridlines => {
  if (!input) return {header: false, columns: false, rows: false};
  if (input === true) return {header: true, columns: true, rows: true};
  return {header: input.header ?? true, columns: input.columns ?? true, rows: input.rows ?? true};
};

/** Map the continuous `spacing` trace (0..1, 0.5 default) to cell padding px. */
const spacingToPad = (spacing: number): number =>
  Math.round(GRID.SpacingMaxPad * (spacing < 0 ? 0 : spacing > 1 ? 1 : spacing));

const cssEscape = (value: string): string => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value);

const setsEqual = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean => {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
};

/**
 * Headless core of the data `Grid`. Owns all view-state (sorting, column order /
 * visibility / sizing), keyed by column and row id rather than stored on the
 * data, and exposes two memoized pipelines: {@link columns} (order, then
 * visibility, then size) and {@link rows} (sort, then flatten), both windowable.
 * Usable without the row UI (tests, custom renderers).
 */
export class GridState<R = unknown> implements UiLifeCycles {
  /** Unique id used to namespace row DOM ids. */
  public readonly gridId = `grid${++counter}`;

  // ------------------------------------------------- data + schema (reactive)
  public readonly data$: rsync.ReactValue<readonly R[]>;
  public readonly columnDefs$: rsync.ReactValue<readonly GridColumnDef<R>[]>;

  // ----------------------------------- column view-state (keyed by column id)
  /** Visible column order; ids not listed keep their definition order at the end. */
  public readonly columnOrder = rsync.val<readonly string[]>([]);
  /** `false` hides a column; absent means visible. */
  public readonly columnVisibility = rsync.val<ReadonlyMap<string, boolean>>(new Map());
  /** Per-column width override in px (resize), clamped to the column's min/max width. */
  public readonly columnSizing: rsync.ReactValue<ReadonlyMap<string, number>>;

  // ----------------------------------------------------------- row view-state
  public readonly sorting: rsync.ReactValue<readonly GridSortSpec[]>;

  // ---------------------------------------------------------------- selection
  public readonly selection$: rsync.ReactValue<GridSelectionMode>;
  /** Prepend the checkbox selection column. */
  public readonly selectionColumn$: rsync.ReactValue<boolean>;
  /** Upper bound on how many rows can be selected (multi mode). */
  public readonly maxSelected$: rsync.ReactValue<number | undefined>;
  /** Selected row ids. */
  public readonly selected: rsync.ReactValue<ReadonlySet<string>>;
  /** The active (focused) cell, or `null`. */
  public readonly activeCell: rsync.ReactValue<GridCellCoord | null>;
  /** Anchor row id the next range selection extends from. */
  private _anchor: string | null = null;

  // --------- layout / presentation (reactive so the view + virtualizer react)
  public readonly rowHeight$: rsync.ReactValue<number>;
  public readonly headerHeight$: rsync.ReactValue<number>;
  public readonly gridlines$: rsync.ReactValue<GridGridlines>;
  public readonly zebra$: rsync.ReactValue<boolean>;
  /** Spacing (density) in `[0.0, 1.0]`; see the `spacing` trace. */
  public readonly spacing$: rsync.ReactValue<number>;
  /** Horizontal cell padding in px, derived from {@link spacing$} (drives the `--jj-grid-pad` CSS variable). */
  public readonly cellPad$: rsync.ReactComputed<number>;
  /** Prepend the row-icon column; joins with the checkbox column when both are on. */
  public readonly iconColumn$: rsync.ReactValue<boolean>;
  /** Show selection checkboxes only on hover / when selected. */
  public readonly muteSelection$: rsync.ReactValue<boolean>;
  /** Master switch for user column resizing. */
  public readonly resizableColumns$: rsync.ReactValue<boolean>;

  /** Id of the column being drag-resized, or `null` (drives the handle + guide line). */
  public readonly resizing$ = rsync.val<string | null>(null);

  /** Id of the column whose header context menu is open, or `null` (one at a time). */
  public readonly headerMenu$ = rsync.val<string | null>(null);

  /** The hovered body cell while a `cellMenu` is rendered, or `null`. */
  public readonly hoverCell$ = rsync.val<GridCellCoord | null>(null);
  /** While true (a cell-menu dropdown is open), hover writes are vetoed. */
  public hoverPinned = false;
  /** The `cellMenu` builder, mirrored from props so rows can render the pill. */
  public readonly cellMenu$ = rsync.val<GridCellMenuBuilder<R> | null>(null);
  /** Stable on/off view of {@link cellMenu$}, so rows don't re-render per builder identity. */
  public readonly cellMenuOn$ = rsync.comp<boolean>([this.cellMenu$], ([builder]) => !!builder);

  // ------------------------------------------------------ drag-resize session
  private _rsStartX = 0;
  private _rsStartWidth = 0;
  private _rsLastX = 0;
  private _rsRafId = 0;
  private _prevUserSelect = '';
  private _prevCursor = '';
  /** Width at the start of a keyboard resize interaction, for Escape to restore. */
  private _kbStart: {column: string; width: number} | null = null;

  /** Column pipeline output — resolved visible columns, defaults applied. */
  public readonly columns: rsync.ReactComputed<GridColumn<R>[]>;
  /** Sum of resolved column widths — the grid's minimum content width in px. */
  public readonly totalWidth: rsync.ReactComputed<number>;
  /** Row pipeline output — the flat visible rows, sorted. */
  public readonly rows: rsync.ReactComputed<GridRowModel<R>[]>;
  /** View-order lookup: row id to index in the sorted {@link rows}. */
  public readonly rowIndexById: rsync.ReactComputed<Map<string, number>>;
  /** Selection coverage of the current rows — drives the header tri-state check. */
  public readonly selectionPhase: rsync.ReactComputed<'none' | 'some' | 'all'>;
  /** Rail-map marks: fractions (0..1) of positions holding at least one selected row. */
  public readonly selectionMarks: rsync.ReactComputed<number[]>;
  /** DOM id of the active cell, for `aria-activedescendant` on the grid container. */
  public readonly activeDescendant: rsync.ReactComputed<string | undefined>;

  /** Native-scroll host; reused by the ScrollArea virtualizer. */
  public readonly scroll = new ScrollState();

  /** Virtual window, registered by `<Grid>` for imperative scrolling. */
  public window: VirtualWindow | null = null;

  constructor(public readonly opts: GridStateOpts<R>) {
    this.data$ = rsync.val<readonly R[]>(opts.data);
    this.columnDefs$ = rsync.val<readonly GridColumnDef<R>[]>(opts.columns);
    this.sorting = rsync.val<readonly GridSortSpec[]>(opts.sorting ?? []);
    this.columnSizing = rsync.val<ReadonlyMap<string, number>>(toSizingMap(opts.columnSizing));
    this.rowHeight$ = rsync.val<number>(opts.rowHeight ?? GRID.RowHeight);
    this.headerHeight$ = rsync.val<number>(opts.headerHeight ?? GRID.HeaderHeight);
    this.gridlines$ = rsync.val<GridGridlines>(toGridlines(opts.gridlines));
    this.zebra$ = rsync.val<boolean>(opts.zebra ?? false);
    this.spacing$ = rsync.val<number>(opts.spacing ?? 0.5);
    this.cellPad$ = rsync.comp<number>([this.spacing$], ([spacing]) => spacingToPad(spacing));
    this.iconColumn$ = rsync.val<boolean>(opts.iconColumn ?? false);
    this.muteSelection$ = rsync.val<boolean>(opts.muteSelection ?? false);
    this.resizableColumns$ = rsync.val<boolean>(opts.resizableColumns ?? true);
    this.selection$ = rsync.val<GridSelectionMode>(opts.selection ?? 'none');
    this.selectionColumn$ = rsync.val<boolean>(opts.selectionColumn ?? false);
    this.maxSelected$ = rsync.val<number | undefined>(opts.maxSelected);
    this.selected = rsync.val<ReadonlySet<string>>(new Set(opts.selected ?? []));
    this.activeCell = rsync.val<GridCellCoord | null>(opts.activeCell ?? null);
    this.columns = rsync.comp<GridColumn<R>[]>(
      [
        this.columnDefs$,
        this.columnOrder,
        this.columnVisibility,
        this.columnSizing,
        this.resizableColumns$,
        this.selection$,
        this.selectionColumn$,
        this.iconColumn$,
      ],
      this.resolveColumns,
    );
    this.totalWidth = rsync.comp<number>([this.columns], ([columns]) => {
      let total = 0;
      for (const column of columns) total += column.width;
      return total;
    });
    this.rows = rsync.comp<GridRowModel<R>[]>([this.data$, this.columnDefs$, this.sorting], this.buildRows);
    this.rowIndexById = rsync.comp<Map<string, number>>([this.rows], ([rows]) => {
      const map = new Map<string, number>();
      for (let i = 0; i < rows.length; i++) map.set(rows[i].id, i);
      return map;
    });
    this.selectionPhase = rsync.comp<'none' | 'some' | 'all'>([this.selected, this.rows], ([selected, rows]) => {
      if (!rows.length || !selected.size) return 'none';
      let count = 0;
      for (const row of rows) if (selected.has(row.id)) count++;
      return count === 0 ? 'none' : count === rows.length ? 'all' : 'some';
    });
    this.selectionMarks = rsync.comp<number[]>(
      [this.selected, this.rows, this.rowIndexById],
      ([selected, rows, indexById]) => {
        const count = rows.length;
        if (!count || !selected.size) return [];
        const buckets = new Set<number>();
        for (const id of selected) {
          const index = indexById.get(id);
          if (index !== undefined) buckets.add(Math.floor((index / count) * GRID.MarkerResolution));
        }
        return [...buckets].sort((a, b) => a - b).map((bucket) => (bucket + 0.5) / GRID.MarkerResolution);
      },
    );
    this.activeDescendant = rsync.comp<string | undefined>(
      [this.activeCell, this.rowIndexById, this.columns],
      ([cell, indexById, columns]) => {
        if (!cell) return undefined;
        const rowIndex = indexById.get(cell.row);
        const column = columns.find((c: GridColumn<R>) => c.id === cell.col);
        return rowIndex === undefined || !column ? undefined : this.cellDomId(rowIndex, column.index);
      },
    );
    // The header is in normal flow before the row canvas, so the windowing math
    // must treat its height as content above row 0.
    this.scroll.headerHeight$.next(this.headerHeight$.value);
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): () => void {
    return () => {
      if (this._rsRafId) {
        cancelAnimationFrame(this._rsRafId);
        this._rsRafId = 0;
      }
    };
  }

  // ---------------------------------------------------------------- pipelines

  private readonly resolveColumns = (): GridColumn<R>[] => {
    const defs = this.columnDefs$.value;
    const order = this.columnOrder.value;
    const visibility = this.columnVisibility.value;
    const sizing = this.columnSizing.value;
    const byId = new Map<string, GridColumnDef<R>>();
    for (const def of defs) byId.set(def.id, def);
    const ordered: GridColumnDef<R>[] = [];
    for (const id of order) {
      const def = byId.get(id);
      if (!def) continue;
      ordered.push(def);
      byId.delete(id);
    }
    for (const def of defs) if (byId.delete(def.id)) ordered.push(def);
    // The synthetic leading columns sit before everything, outside the
    // order/visibility view-state, so they are always first and always
    // visible. When both are requested they join: the selection column also
    // hosts the row icon (icon at rest, checkbox on hover/selection).
    const selectOn = this.selectionColumn$.value && this.selection$.value !== 'none';
    if (selectOn) ordered.unshift(selectColumnDef as GridColumnDef<R>);
    else if (this.iconColumn$.value) ordered.unshift(iconColumnDef as GridColumnDef<R>);
    const resizableAll = this.resizableColumns$.value;
    const columns: GridColumn<R>[] = [];
    for (const def of ordered) {
      if (visibility.get(def.id) === false) continue;
      const type = columnType(def.type);
      const minWidth = def.minWidth ?? GRID.MinColWidth;
      const maxWidth = def.maxWidth;
      const override = sizing.get(def.id);
      let width = override ?? def.width ?? GRID.ColWidth;
      if (width < minWidth) width = minWidth;
      if (maxWidth !== undefined && width > maxWidth) width = maxWidth;
      columns.push({
        def,
        id: def.id,
        index: columns.length,
        type: def.type ?? 'text',
        width,
        minWidth,
        maxWidth,
        // A user-set width is exact: an override freezes the column's flex growth.
        flex: override !== undefined ? 0 : (def.flex ?? 0),
        align: def.align ?? type.align,
        sortable: def.sortable !== false,
        resizable: resizableAll && def.resizable !== false,
        special: def.special ?? false,
        divider: true,
        getValue: def.accessor ?? defaultAccessor<R>(def.id),
        compare: def.compare ?? type.compare,
      });
    }
    // Vertical gridlines separate content cells but never touch specialized
    // columns (selection, icon, actions): a specialized column draws no right
    // divider, and neither does the column just before it.
    for (let i = 0; i < columns.length; i++)
      columns[i].divider = !columns[i].special && !(i + 1 < columns.length && columns[i + 1].special);
    return columns;
  };

  private readonly buildRows = (): GridRowModel<R>[] => {
    const data = this.data$.value;
    const getId = this.opts.getId;
    const rows: GridRowModel<R>[] = [];
    for (let i = 0; i < data.length; i++)
      rows.push({id: getId ? getId(data[i], i) : String(i), data: data[i], index: i});
    const comparators = this.sortComparators();
    if (comparators.length) {
      rows.sort((a, b) => {
        for (const {getValue, compare, mult} of comparators) {
          const av = getValue(a.data);
          const bv = getValue(b.data);
          const aNull = av === undefined || av === null;
          const bNull = bv === undefined || bv === null;
          if (aNull || bNull) {
            // Empty cells sink to the bottom regardless of direction.
            if (aNull !== bNull) return aNull ? 1 : -1;
            continue;
          }
          const result = compare(av, bv);
          if (result) return result * mult;
        }
        return a.index - b.index;
      });
      for (let i = 0; i < rows.length; i++) rows[i].index = i;
    }
    return rows;
  };

  private sortComparators(): RowComparator<R>[] {
    const specs = this.sorting.value;
    if (!specs.length) return [];
    const defs = this.columnDefs$.value;
    const comparators: RowComparator<R>[] = [];
    for (const spec of specs) {
      const def = defs.find((d) => d.id === spec.column);
      if (!def) continue;
      comparators.push({
        getValue: def.accessor ?? defaultAccessor<R>(def.id),
        compare: def.compare ?? columnType(def.type).compare,
        mult: spec.dir === 'desc' ? -1 : 1,
      });
    }
    return comparators;
  }

  // ----------------------------------------------------------------- commands

  public setData(data: readonly R[]): void {
    this.data$.next(data);
  }

  public setColumns(defs: readonly GridColumnDef<R>[]): void {
    this.columnDefs$.next(defs);
  }

  public setLayout(
    layout: Partial<
      Pick<
        GridStateOpts<R>,
        | 'rowHeight'
        | 'headerHeight'
        | 'gridlines'
        | 'zebra'
        | 'spacing'
        | 'resizableColumns'
        | 'selection'
        | 'selectionColumn'
        | 'maxSelected'
        | 'iconColumn'
        | 'muteSelection'
      >
    >,
  ): void {
    if (layout.rowHeight !== undefined) this.rowHeight$.set(layout.rowHeight);
    if (layout.headerHeight !== undefined) {
      this.headerHeight$.set(layout.headerHeight);
      this.scroll.headerHeight$.next(layout.headerHeight);
    }
    if (layout.gridlines !== undefined) this.gridlines$.set(toGridlines(layout.gridlines));
    if (layout.zebra !== undefined) this.zebra$.set(layout.zebra);
    if (layout.spacing !== undefined) this.spacing$.set(layout.spacing);
    if (layout.resizableColumns !== undefined) this.resizableColumns$.set(layout.resizableColumns);
    if (layout.selection !== undefined) this.selection$.set(layout.selection);
    if (layout.selectionColumn !== undefined) this.selectionColumn$.set(layout.selectionColumn);
    if (layout.maxSelected !== undefined) this.maxSelected$.set(layout.maxSelected);
    if (layout.iconColumn !== undefined) this.iconColumn$.set(layout.iconColumn);
    if (layout.muteSelection !== undefined) this.muteSelection$.set(layout.muteSelection);
  }

  public setSorting(next: readonly GridSortSpec[], fromProps = false): void {
    this.sorting.set(next);
    if (!fromProps) this.opts.onSortingChange?.(next);
  }

  /**
   * Header-click sort. Cycles the column ascending, then descending, then off.
   * `additive` (shift-click) keeps the other sorted columns and cycles this one
   * in place, appending it at the lowest priority when new.
   */
  public readonly sortBy = (columnId: string, additive?: boolean): void => {
    const def = this.columnDefs$.value.find((d) => d.id === columnId);
    if (!def || def.sortable === false) return;
    const sorting = this.sorting.value;
    const index = sorting.findIndex((s) => s.column === columnId);
    const current = index >= 0 ? sorting[index] : undefined;
    const nextDir: GridSortDir | undefined = !current ? 'asc' : current.dir === 'asc' ? 'desc' : undefined;
    let next: GridSortSpec[];
    if (additive) {
      if (!current) next = [...sorting, {column: columnId, dir: 'asc'}];
      else if (nextDir) next = sorting.map((s, i) => (i === index ? {column: columnId, dir: nextDir} : s));
      else next = sorting.filter((_, i) => i !== index);
    } else {
      next = nextDir ? [{column: columnId, dir: nextDir}] : [];
    }
    this.setSorting(next);
  };

  /**
   * Set (or clear, with `null`) a column's sort direction explicitly — the
   * header menu's verbs, where the header click has a cycle. `additive` keeps
   * the other sorted columns (the Shift-click semantics).
   */
  public sortColumn(columnId: string, dir: GridSortDir | null, additive = false): void {
    const def = this.columnDefs$.value.find((d) => d.id === columnId);
    if (!def || def.sortable === false) return;
    const sorting = this.sorting.value;
    const index = sorting.findIndex((s) => s.column === columnId);
    let next: GridSortSpec[];
    if (dir === null) {
      if (index < 0) return;
      next = sorting.filter((_, i) => i !== index);
    } else if (additive) {
      next =
        index >= 0
          ? sorting.map((s, i) => (i === index ? {column: columnId, dir} : s))
          : [...sorting, {column: columnId, dir}];
    } else {
      next = [{column: columnId, dir}];
    }
    this.setSorting(next);
  }

  // -------------------------------------------------------------- header menu

  public openHeaderMenu(columnId: string): void {
    this.headerMenu$.next(columnId);
  }

  public closeHeaderMenu(): void {
    if (this.headerMenu$.value !== null) this.headerMenu$.next(null);
  }

  public toggleHeaderMenu(columnId: string): void {
    this.headerMenu$.next(this.headerMenu$.value === columnId ? null : columnId);
  }

  // --------------------------------------------------- cell hover (cell menu)

  /** Dismissed cell — the pill stays hidden while the pointer remains on it. */
  private _hoverSuppressed: GridCellCoord | null = null;

  public setHoverCell(cell: GridCellCoord): void {
    if (this.hoverPinned) return;
    const prev = this.hoverCell$.value;
    if (prev && prev.row === cell.row && prev.col === cell.col) return;
    this.hoverCell$.next(cell);
  }

  /** `force` overrides the dropdown pin — scroll and drag-resize always hide. */
  public clearHoverCell(force = false): void {
    if (this.hoverPinned && !force) return;
    if (this.hoverCell$.value !== null) this.hoverCell$.next(null);
  }

  /**
   * Hide the pill after an action fires — and keep it hidden while the
   * pointer stays on that cell (a plain clear would re-show it on the very
   * next pointer move, since the pointer still hovers the cell). Moving to
   * any other cell, or off and back onto this one, lifts the suppression.
   */
  public dismissCellMenu(): void {
    this._hoverSuppressed = this.hoverCell$.value;
    this.clearHoverCell(true);
  }

  /**
   * Delegated `pointerover` for the whole row canvas — one listener pair on
   * the content element instead of enter/leave props on every virtualized
   * cell. Resolves the hovered coordinate from the DOM the grid already
   * stamps (`data-row` on rows, `data-col` on cells); targets inside the
   * pill itself keep the current value, anything unresolvable clears it.
   */
  public readonly onCellsPointerOver = (e: React.PointerEvent): void => {
    if (e.pointerType === 'touch') return; // No hover model on touch.
    const target = e.target as Element | null;
    if (!target || typeof target.closest !== 'function') return;
    if (target.closest('[data-grid-cellmenu]')) return;
    const cellEl = target.closest('[role="gridcell"]');
    if (!cellEl && target.closest('[data-row]')) {
      // When the pill (a row child) unmounts under the cursor, Chrome
      // retargets the boundary event to the removed node's PARENT — the row
      // div, not the cell beneath. Treat row-level targets as that noise:
      // clearing here would drop the dismiss suppression and the very next
      // (real) pointerover on the cell would re-show the pill.
      return;
    }
    const rowId = cellEl?.closest('[data-row]')?.getAttribute('data-row');
    const colId = cellEl?.getAttribute('data-col');
    const column = colId ? this.columnById(colId) : undefined;
    if (!rowId || !column || column.special) {
      this._hoverSuppressed = null;
      this.clearHoverCell();
      return;
    }
    const suppressed = this._hoverSuppressed;
    if (suppressed && suppressed.row === rowId && suppressed.col === column.id) return;
    this._hoverSuppressed = null;
    this.setHoverCell({row: rowId, col: column.id});
  };

  public readonly onCellsPointerLeave = (): void => {
    this._hoverSuppressed = null;
    this.clearHoverCell();
  };

  /**
   * Scrolling slides rows under a stationary pointer without any pointer
   * event firing — drop the hover (and any open pill dropdown) instead of
   * letting the pill drift off its cell.
   */
  public readonly onCellsScroll = (): void => {
    this.clearHoverCell(true);
  };

  public setColumnSizing(next: GridColumnSizingInput, fromProps = false): void {
    const map = toSizingMap(next);
    this.columnSizing.next(map);
    if (!fromProps) this.opts.onColumnSizingChange?.(map);
  }

  /** Live width write (drag frames); clamped to the column min/max. Does not commit. */
  public resizeColumn(columnId: string, width: number): void {
    const def = this.columnDefs$.value.find((d) => d.id === columnId);
    if (!def) return;
    const clamped = this.clampWidth(def, width);
    if (this.columnSizing.value.get(columnId) === clamped) return;
    const next = new Map(this.columnSizing.value);
    next.set(columnId, clamped);
    this.columnSizing.next(next);
  }

  /** Remove a column's width override, restoring its definition width and flex. */
  public resetColumn(columnId: string): void {
    if (!this.columnSizing.value.has(columnId)) return;
    const next = new Map(this.columnSizing.value);
    next.delete(columnId);
    this.setColumnSizing(next);
  }

  /**
   * Size the column to its content: the widest rendered cell (current virtual
   * window plus the header), approximate by design. Content width is read from
   * `scrollWidth`, which sees through the ellipsis truncation.
   */
  public autoFitColumn(columnId: string): void {
    const column = this.columnById(columnId);
    const viewport = this.scroll.viewportEl;
    if (!column || !column.resizable || !viewport) return;
    this.freezeFlexWidths();
    const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(columnId) : columnId;
    const cells = viewport.querySelectorAll(`[data-col="${escaped}"]`);
    let max = 0;
    for (let i = 0; i < cells.length; i++) {
      const children = cells[i].children;
      let width = 0;
      let count = 0;
      for (let j = 0; j < children.length; j++) {
        const child = children[j] as HTMLElement;
        if (child.getAttribute('role') === 'separator') continue;
        width += child.scrollWidth;
        count++;
      }
      if (count > 1) width += (count - 1) * GRID.HeaderGap;
      if (width > max) max = width;
    }
    if (!max) return;
    this.resizeColumn(columnId, max + 2 * this.cellPad$.value + 1);
    this.commitSizing();
  }

  private clampWidth(def: GridColumnDef<R>, width: number): number {
    const min = def.minWidth ?? GRID.MinColWidth;
    const max = def.maxWidth;
    let clamped = Math.round(width);
    if (clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;
    return clamped;
  }

  private columnById(columnId: string): GridColumn<R> | undefined {
    return this.columns.value.find((c) => c.id === columnId);
  }

  private commitSizing(): void {
    this.opts.onColumnSizingChange?.(this.columnSizing.value);
  }

  // ---------------------------------------------------------------- selection

  public setSelected(next: ReadonlySet<string>, fromProps = false): void {
    if (setsEqual(this.selected.value, next)) return;
    this.selected.next(next);
    if (!fromProps) this.opts.onSelectionChange?.(next, this);
  }

  public isSelected(id: string): boolean {
    return this.selected.value.has(id);
  }

  /**
   * Combine one row into the selection: `replace` starts over, `toggle`
   * (Cmd/Ctrl-click) flips the row, `range` (Shift-click) extends from the
   * anchor over view order. `replace` and `toggle` move the anchor; `range`
   * keeps it, so repeated Shift-clicks pivot around the same row.
   */
  public readonly select = (id: string, mode: GridSelectMode = 'replace'): void => {
    const selectionMode = this.selection$.value;
    if (selectionMode === 'none') return;
    const single = selectionMode === 'single';
    const current = this.selected.value;
    let next: Set<string>;
    if (mode === 'toggle') {
      if (single) next = new Set(current.has(id) ? [] : [id]);
      else {
        next = new Set(current);
        if (next.has(id)) next.delete(id);
        else if (next.size < (this.maxSelected$.value ?? Infinity)) next.add(id);
        else return; // At the cap: the add is a no-op, like a full checkbox group.
      }
    } else if (mode === 'range' && !single && this._anchor) {
      next = this.rangeSelect(this._anchor, id);
    } else {
      next = new Set([id]);
    }
    this.setSelected(next);
    if (mode !== 'range') this._anchor = id;
  };

  /** Additive range over view order; at the cap, rows nearest the anchor win. */
  private rangeSelect(from: string, to: string): Set<string> {
    const rows = this.rows.value;
    const indexById = this.rowIndexById.value;
    const a = indexById.get(from);
    const b = indexById.get(to);
    if (a === undefined || b === undefined) return new Set([to]);
    const next = new Set(this.selected.value);
    const max = this.maxSelected$.value ?? Infinity;
    const dir = b >= a ? 1 : -1;
    for (let i = a; dir > 0 ? i <= b : i >= b; i += dir) {
      const id = rows[i].id;
      if (!next.has(id)) {
        if (next.size >= max) break;
        next.add(id);
      }
    }
    return next;
  }

  /** Select every row (multi mode), clamped to `maxSelected` in view order. */
  public selectAll(): void {
    if (this.selection$.value !== 'multi') return;
    const max = this.maxSelected$.value ?? Infinity;
    const next = new Set<string>();
    for (const row of this.rows.value) {
      if (next.size >= max) break;
      next.add(row.id);
    }
    this.setSelected(next);
  }

  public clearSelection(): void {
    if (this.selected.value.size) this.setSelected(new Set());
  }

  // -------------------------------------------------------------- active cell

  public setActiveCell(cell: GridCellCoord | null, fromProps = false): void {
    const prev = this.activeCell.value;
    if (prev === cell || (prev && cell && prev.row === cell.row && prev.col === cell.col)) return;
    this.activeCell.next(cell);
    if (!fromProps) this.opts.onActiveCellChange?.(cell, this);
  }

  /** Stable DOM id of a cell by view position, for `aria-activedescendant`. */
  public cellDomId(rowIndex: number, colIndex: number): string {
    return `${this.gridId}-${rowIndex}-${colIndex}`;
  }

  /** The rendered cell element, or `null` when outside the virtual window. */
  public cellElement(cell: GridCellCoord): HTMLElement | null {
    const viewport = this.scroll.viewportEl;
    if (!viewport) return null;
    return viewport.querySelector(`[data-row="${cssEscape(cell.row)}"] [data-col="${cssEscape(cell.col)}"]`);
  }

  /** Focus a cell through the `onCellFocus` veto; returns whether it took. */
  private tryFocusCell(row: GridRowModel<R>, column: GridColumn<R>): boolean {
    if (column.special) return false;
    const cell: GridCellCoord = {row: row.id, col: column.id};
    if (this.opts.onCellFocus?.(cell, column, row, this) === false) return false;
    this.setActiveCell(cell);
    return true;
  }

  /**
   * Move the active cell by whole steps, scanning past vetoed cells in the
   * same direction and stopping at the grid edge (no wrap). With no active
   * cell yet, activates the first focusable cell of the first row.
   */
  public moveActiveCell(dRow: number, dCol: number): void {
    const rows = this.rows.value;
    const columns = this.columns.value;
    if (!rows.length || !columns.length) return;
    const current = this.activeCell.value;
    if (!current) {
      for (const column of columns)
        if (this.tryFocusCell(rows[0], column)) {
          this.scrollCellIntoView(0, column.id);
          return;
        }
      return;
    }
    let rowIndex = this.rowIndexById.value.get(current.row) ?? 0;
    let colIndex = columns.findIndex((c) => c.id === current.col);
    if (colIndex < 0) colIndex = 0;
    while (true) {
      rowIndex += dRow;
      colIndex += dCol;
      if (rowIndex < 0 || rowIndex >= rows.length || colIndex < 0 || colIndex >= columns.length) return;
      if (this.tryFocusCell(rows[rowIndex], columns[colIndex])) {
        this.scrollCellIntoView(rowIndex, columns[colIndex].id);
        return;
      }
      if (!dRow && !dCol) return;
    }
  }

  /**
   * Reveal a cell. Vertically the sticky header overlays the viewport top, so
   * a row above the fold aligns below the header and a row below the fold
   * bottom-aligns. Horizontally the rendered cell is measured (flex columns
   * make arithmetic widths unreliable) and the scroller nudged just enough.
   */
  private scrollCellIntoView(rowIndex: number, colId: string): void {
    const viewport = this.scroll.viewportEl;
    if (!viewport) return;
    const rowHeight = this.rowHeight$.value;
    const headerHeight = this.headerHeight$.value;
    const rowTop = headerHeight + rowIndex * rowHeight;
    if (rowTop < viewport.scrollTop + headerHeight) viewport.scrollTop = rowIndex * rowHeight;
    else if (rowTop + rowHeight > viewport.scrollTop + viewport.clientHeight)
      viewport.scrollTop = rowTop + rowHeight - viewport.clientHeight;
    const el = this.cellElement({row: this.rows.value[rowIndex].id, col: colId});
    if (!el) return;
    const cellRect = el.getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();
    if (cellRect.left < viewRect.left) viewport.scrollLeft += cellRect.left - viewRect.left;
    else if (cellRect.right > viewRect.right)
      viewport.scrollLeft += Math.min(cellRect.right - viewRect.right, cellRect.left - viewRect.left);
  }

  /** Scroll so `fraction` (0..1) of the canvas is at the viewport top — rail-mark jumps. */
  public scrollToFraction(fraction: number): void {
    const viewport = this.scroll.viewportEl;
    if (!viewport) return;
    viewport.scrollTop = fraction * (viewport.scrollHeight - viewport.clientHeight);
  }

  private fireCellAction(row: GridRowModel<R>, column: GridColumn<R>): void {
    const cell: GridCellCoord = {row: row.id, col: column.id};
    this.opts.onCellAction?.(cell, column, row, this.cellElement(cell), this);
  }

  private activeTarget(): {row: GridRowModel<R>; column: GridColumn<R>} | null {
    const cell = this.activeCell.value;
    if (!cell) return null;
    const rowIndex = this.rowIndexById.value.get(cell.row);
    const column = this.columns.value.find((c) => c.id === cell.col);
    if (rowIndex === undefined || !column) return null;
    return {row: this.rows.value[rowIndex], column};
  }

  // ------------------------------------------------- pointer + keyboard input

  public readonly onCellPointerDown = (row: GridRowModel<R>, column: GridColumn<R>, e: React.PointerEvent): void => {
    if (e.button !== 0) return;
    // Shift-click ranges must not start a native text range selection.
    if (e.shiftKey) e.preventDefault();
    if (column.id === GRID_SELECT_COL) return; // The Check owns clicks there.
    this.tryFocusCell(row, column);
    if (this.selection$.value === 'none' || this.opts.selectOnRowClick === false) return;
    this.select(row.id, e.shiftKey ? 'range' : e.metaKey || e.ctrlKey ? 'toggle' : 'replace');
  };

  public readonly onCellDoubleClick = (row: GridRowModel<R>, column: GridColumn<R>): void => {
    if (column.id === GRID_SELECT_COL) return;
    this.fireCellAction(row, column);
  };

  /**
   * The grid-container keyboard model. Real focus stays on the scroller
   * (`aria-activedescendant` points at the active cell); interactive
   * descendants (resize handles, checkboxes) own their keys, so events not
   * targeting the container itself pass through untouched.
   */
  public readonly onGridKeyDown = (e: React.KeyboardEvent): void => {
    if (e.target !== e.currentTarget) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight': {
        e.preventDefault();
        const vertical = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        const horizontal = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        this.moveActiveCell(vertical, horizontal);
        return;
      }
      case 'Enter': {
        const target = this.activeTarget();
        if (!target) return;
        e.preventDefault();
        this.fireCellAction(target.row, target.column);
        return;
      }
      case ' ': {
        const target = this.activeTarget();
        if (!target) return;
        e.preventDefault();
        // The ARIA grid convention: Space is selection; it falls back to the
        // cell action when selection is off.
        if (this.selection$.value !== 'none') this.select(target.row.id, 'toggle');
        else this.fireCellAction(target.row, target.column);
        return;
      }
      case 'Escape':
        if (this.activeCell.value) this.setActiveCell(null);
        else this.clearSelection();
        return;
      case 'a':
      case 'A':
        if ((e.metaKey || e.ctrlKey) && this.selection$.value === 'multi') {
          e.preventDefault();
          this.selectAll();
        }
        return;
    }
  };

  // ---------------------------------------------------- drag resize (pointer)

  public readonly onResizePointerDown = (columnId: string, e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return;
    let column = this.columnById(columnId);
    if (!column || !column.resizable) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    this.closeHeaderMenu();
    this.clearHoverCell(true);
    this.freezeFlexWidths();
    column = this.columnById(columnId) ?? column;
    this._rsStartX = this._rsLastX = e.clientX;
    this._rsStartWidth = column.width;
    this.resizing$.next(columnId);
    if (typeof document !== 'undefined') {
      const body = document.body;
      this._prevUserSelect = body.style.userSelect;
      this._prevCursor = body.style.cursor;
      body.style.userSelect = 'none';
      body.style.cursor = 'col-resize';
    }
  };

  public readonly onResizePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!this.resizing$.value) return;
    // A release outside the window can swallow the pointer-up; the first move
    // that arrives without the primary button pressed ends the drag instead of
    // rubber-banding the column to a long-released pointer.
    if (e.buttons !== undefined && (e.buttons & 1) === 0) {
      this.releaseCapture(e);
      this.finishResize();
      return;
    }
    this._rsLastX = e.clientX;
    if (typeof requestAnimationFrame === 'undefined') {
      this.applyDrag();
      return;
    }
    if (this._rsRafId) return;
    this._rsRafId = requestAnimationFrame(() => {
      this._rsRafId = 0;
      this.applyDrag();
    });
  };

  public readonly onResizePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!this.resizing$.value) return;
    this.releaseCapture(e);
    this._rsLastX = e.clientX;
    this.finishResize();
  };

  /** Safety net: ending a drag whenever the browser revokes the pointer capture. */
  public readonly onResizeLostCapture = (): void => {
    if (!this.resizing$.value) return;
    this.finishResize();
  };

  private releaseCapture(e: React.PointerEvent<HTMLDivElement>): void {
    const target = e.currentTarget;
    if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId);
  }

  /** Apply the last pressed position, end the drag session, and commit. */
  private finishResize(): void {
    if (this._rsRafId) {
      cancelAnimationFrame(this._rsRafId);
      this._rsRafId = 0;
    }
    this.applyDrag();
    this.resizing$.next(null);
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = this._prevUserSelect;
      document.body.style.cursor = this._prevCursor;
    }
    this.commitSizing();
  }

  private applyDrag(): void {
    const columnId = this.resizing$.value;
    if (!columnId) return;
    this.resizeColumn(columnId, this._rsStartWidth + this._rsLastX - this._rsStartX);
  }

  /**
   * Resolve every flex column to its currently rendered width before a manual
   * resize. Flex growth redistributes leftover space whenever any width
   * changes, which visually moves the opposite edge of the dragged column;
   * pinning flex columns to pixels hands the layout to the user (a manually
   * sized table stops auto-stretching).
   */
  private freezeFlexWidths(): void {
    const viewport = this.scroll.viewportEl;
    if (!viewport) return;
    let next: Map<string, number> | null = null;
    for (const column of this.columns.value) {
      if (column.flex <= 0) continue;
      const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(column.id) : column.id;
      const cell = viewport.querySelector(`[role="columnheader"][data-col="${escaped}"]`);
      if (!cell) continue;
      const width = Math.round(cell.getBoundingClientRect().width);
      if (!width) continue;
      if (!next) next = new Map(this.columnSizing.value);
      next.set(column.id, this.clampWidth(column.def, width));
    }
    if (next) this.columnSizing.next(next);
  }

  // ------------------------------------------------- keyboard resize (handle)

  public readonly onResizeKeyDown = (columnId: string, e: React.KeyboardEvent): void => {
    let column = this.columnById(columnId);
    if (!column || !column.resizable) return;
    if (!this._kbStart || this._kbStart.column !== columnId) {
      this.freezeFlexWidths();
      column = this.columnById(columnId) ?? column;
      this._kbStart = {column: columnId, width: column.width};
    }
    const step = e.shiftKey ? GRID.ResizeLargeStep : GRID.ResizeStep;
    let width: number;
    switch (e.key) {
      case 'ArrowLeft':
        width = column.width - step;
        break;
      case 'ArrowRight':
        width = column.width + step;
        break;
      case 'Home':
        width = column.minWidth;
        break;
      case 'End':
        e.preventDefault();
        this.autoFitColumn(columnId);
        this.announceWidth(columnId);
        return;
      case 'Escape':
        width = this._kbStart.width;
        break;
      default:
        return;
    }
    e.preventDefault();
    this.resizeColumn(columnId, width);
    this.commitSizing();
    this.announceWidth(columnId);
  };

  /** Clear the Escape-restore snapshot when the handle loses focus. */
  public readonly onResizeBlur = (): void => {
    this._kbStart = null;
  };

  private announceWidth(columnId: string): void {
    const column = this.columnById(columnId);
    if (column) announce(`${columnLabel(column)} column ${formatSizeForAnnouncement(column.width)}`);
  }

  public readonly setViewport = (el: HTMLDivElement | null): void => {
    this.scroll.setViewport(el);
  };
}
