import {describe, expect, it, vi} from 'vitest';
import {columnMenuItems} from './menu';
import {GridState} from './state';
import type {GridColumnDef, GridStateOpts} from './types';

interface Item {
  name: string;
  size?: number | null;
  done: boolean;
  when: Date;
}

const data: Item[] = [
  {name: 'bravo', size: 30, done: false, when: new Date(2026, 0, 3)},
  {name: 'alpha', size: 10, done: true, when: new Date(2026, 0, 2)},
  {name: 'delta', size: null, done: false, when: new Date(2026, 0, 1)},
  {name: 'charlie', size: 20, done: true, when: new Date(2026, 0, 4)},
];

const columns: GridColumnDef<Item>[] = [
  {id: 'name', header: 'Name'},
  {id: 'size', header: 'Size', type: 'number', width: 80},
  {id: 'done', header: 'Done', type: 'bool'},
  {id: 'when', header: 'When', type: 'date'},
];

const make = (opts: Partial<GridStateOpts<Item>> = {}) =>
  new GridState<Item>({data, columns, getId: (item) => item.name, ...opts});

const names = (s: GridState<Item>) => s.rows.value.map((r) => (r.data as Item).name);

describe('GridState — column pipeline', () => {
  it('resolves defaults: order, width, min width, alignment, sortable', () => {
    const s = make();
    const cols = s.columns.value;
    expect(cols.map((c) => c.id)).toEqual(['name', 'size', 'done', 'when']);
    expect(cols.map((c) => c.index)).toEqual([0, 1, 2, 3]);
    expect(cols[0].width).toBe(120);
    expect(cols[1].width).toBe(80);
    expect(cols[0].align).toBe('left');
    expect(cols[1].align).toBe('right');
    expect(cols[2].align).toBe('center');
    expect(cols.every((c) => c.sortable)).toBe(true);
    expect(s.totalWidth.value).toBe(120 + 80 + 120 + 120);
  });

  it('applies column order, keeping unlisted columns in definition order', () => {
    const s = make();
    s.columnOrder.next(['when', 'name']);
    expect(s.columns.value.map((c) => c.id)).toEqual(['when', 'name', 'size', 'done']);
  });

  it('hides columns via visibility and reindexes the rest', () => {
    const s = make();
    s.columnVisibility.next(new Map([['size', false]]));
    const cols = s.columns.value;
    expect(cols.map((c) => c.id)).toEqual(['name', 'done', 'when']);
    expect(cols.map((c) => c.index)).toEqual([0, 1, 2]);
  });

  it('applies sizing overrides, clamped to the column min width', () => {
    const s = make();
    s.resizeColumn('name', 300);
    s.resizeColumn('size', 1);
    const cols = s.columns.value;
    expect(cols[0].width).toBe(300);
    expect(cols[1].width).toBe(40);
    expect(s.totalWidth.value).toBe(300 + 40 + 120 + 120);
  });

  it('reads cell values through the default accessor and a custom accessor', () => {
    const s = make({
      columns: [{id: 'name'}, {id: 'upper', accessor: (item: Item) => item.name.toUpperCase()}],
    });
    const [name, upper] = s.columns.value;
    expect(name.getValue(data[0])).toBe('bravo');
    expect(upper.getValue(data[0])).toBe('BRAVO');
  });
});

describe('GridState — row pipeline', () => {
  it('keeps data order and assigns ids and indexes when unsorted', () => {
    const s = make();
    expect(names(s)).toEqual(['bravo', 'alpha', 'delta', 'charlie']);
    expect(s.rows.value.map((r) => r.id)).toEqual(['bravo', 'alpha', 'delta', 'charlie']);
    expect(s.rows.value.map((r) => r.index)).toEqual([0, 1, 2, 3]);
  });

  it('sorts by text, number, bool, and date columns', () => {
    const s = make();
    s.setSorting([{column: 'name', dir: 'asc'}]);
    expect(names(s)).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    s.setSorting([{column: 'size', dir: 'desc'}]);
    expect(names(s)).toEqual(['bravo', 'charlie', 'alpha', 'delta']);
    s.setSorting([{column: 'done', dir: 'desc'}]);
    expect(names(s)).toEqual(['alpha', 'charlie', 'bravo', 'delta']);
    s.setSorting([{column: 'when', dir: 'asc'}]);
    expect(names(s)).toEqual(['delta', 'alpha', 'bravo', 'charlie']);
  });

  it('sinks nullish values to the bottom regardless of direction', () => {
    const s = make();
    s.setSorting([{column: 'size', dir: 'asc'}]);
    expect(names(s)).toEqual(['alpha', 'charlie', 'bravo', 'delta']);
    s.setSorting([{column: 'size', dir: 'desc'}]);
    expect(names(s)).toEqual(['bravo', 'charlie', 'alpha', 'delta']);
  });

  it('multi-sorts with priority and keeps original order as the tiebreak', () => {
    const s = make();
    s.setSorting([
      {column: 'done', dir: 'desc'},
      {column: 'name', dir: 'asc'},
    ]);
    expect(names(s)).toEqual(['alpha', 'charlie', 'bravo', 'delta']);
    // Equal on every sorted column: original data order decides.
    s.setSorting([{column: 'done', dir: 'asc'}]);
    expect(names(s)).toEqual(['bravo', 'delta', 'alpha', 'charlie']);
  });

  it('uses a custom comparator when provided', () => {
    const byLength: GridColumnDef<Item>[] = [{id: 'name', compare: (a: string, b: string) => a.length - b.length}];
    const s = make({columns: byLength});
    s.setSorting([{column: 'name', dir: 'asc'}]);
    expect(names(s)).toEqual(['bravo', 'alpha', 'delta', 'charlie']);
  });

  it('reindexes rows after sorting', () => {
    const s = make();
    s.setSorting([{column: 'name', dir: 'asc'}]);
    expect(s.rows.value.map((r) => r.index)).toEqual([0, 1, 2, 3]);
  });

  it('ignores sort specs for unknown columns', () => {
    const s = make();
    s.setSorting([{column: 'nope', dir: 'asc'}]);
    expect(names(s)).toEqual(['bravo', 'alpha', 'delta', 'charlie']);
  });
});

describe('GridState — sortBy', () => {
  it('cycles a column ascending, descending, off', () => {
    const s = make();
    s.sortBy('name');
    expect(s.sorting.value).toEqual([{column: 'name', dir: 'asc'}]);
    s.sortBy('name');
    expect(s.sorting.value).toEqual([{column: 'name', dir: 'desc'}]);
    s.sortBy('name');
    expect(s.sorting.value).toEqual([]);
  });

  it('replaces the sort when not additive', () => {
    const s = make({sorting: [{column: 'size', dir: 'asc'}]});
    s.sortBy('name');
    expect(s.sorting.value).toEqual([{column: 'name', dir: 'asc'}]);
  });

  it('additive appends a new column and cycles an existing one in place', () => {
    const s = make();
    s.sortBy('name');
    s.sortBy('size', true);
    expect(s.sorting.value).toEqual([
      {column: 'name', dir: 'asc'},
      {column: 'size', dir: 'asc'},
    ]);
    s.sortBy('name', true);
    expect(s.sorting.value).toEqual([
      {column: 'name', dir: 'desc'},
      {column: 'size', dir: 'asc'},
    ]);
    s.sortBy('name', true);
    expect(s.sorting.value).toEqual([{column: 'size', dir: 'asc'}]);
  });

  it('does nothing for a non-sortable column', () => {
    const s = make({columns: [{id: 'name', sortable: false}]});
    s.sortBy('name');
    expect(s.sorting.value).toEqual([]);
  });

  it('fires onSortingChange for user sorts but not for prop syncs', () => {
    const onSortingChange = vi.fn();
    const s = make({onSortingChange});
    s.sortBy('name');
    expect(onSortingChange).toHaveBeenCalledTimes(1);
    expect(onSortingChange).toHaveBeenCalledWith([{column: 'name', dir: 'asc'}]);
    s.setSorting([{column: 'size', dir: 'asc'}], true);
    expect(onSortingChange).toHaveBeenCalledTimes(1);
  });
});

describe('GridState — reactive updates', () => {
  it('recomputes rows when data is swapped', () => {
    const s = make();
    s.setSorting([{column: 'name', dir: 'asc'}]);
    s.setData([data[0], data[3]]);
    expect(names(s)).toEqual(['bravo', 'charlie']);
  });

  it('recomputes columns when definitions are swapped', () => {
    const s = make();
    s.setColumns([{id: 'name'}]);
    expect(s.columns.value.map((c) => c.id)).toEqual(['name']);
    expect(s.totalWidth.value).toBe(120);
  });

  it('propagates header height to the scroll state for the windowing math', () => {
    const s = make({headerHeight: 40});
    expect(s.scroll.headerHeight$.value).toBe(40);
    s.setLayout({headerHeight: 24});
    expect(s.scroll.headerHeight$.value).toBe(24);
  });
});

const pointerTarget = () => {
  const captured = new Set<number>();
  return {
    setPointerCapture: (id: number) => captured.add(id),
    releasePointerCapture: (id: number) => captured.delete(id),
    hasPointerCapture: (id: number) => captured.has(id),
  };
};

const ptr = (clientX: number, target: ReturnType<typeof pointerTarget>, buttons = 1) =>
  ({
    button: 0,
    buttons,
    pointerId: 1,
    clientX,
    currentTarget: target,
    preventDefault: () => {},
    stopPropagation: () => {},
  }) as any;

const kbd = (key: string, mods: Partial<{shiftKey: boolean}> = {}) =>
  ({key, shiftKey: false, preventDefault: () => {}, ...mods}) as any;

describe('GridState — column sizing pipeline', () => {
  it('clamps the resolved width to maxWidth', () => {
    const s = make({columns: [{id: 'name', width: 500, maxWidth: 300}]});
    expect(s.columns.value[0].width).toBe(300);
  });

  it('freezes flex while a sizing override exists and restores it on reset', () => {
    const s = make({columns: [{id: 'name', width: 200, flex: 1}]});
    expect(s.columns.value[0].flex).toBe(1);
    s.resizeColumn('name', 250);
    expect(s.columns.value[0].flex).toBe(0);
    expect(s.columns.value[0].width).toBe(250);
    s.resetColumn('name');
    expect(s.columns.value[0].flex).toBe(1);
    expect(s.columns.value[0].width).toBe(200);
  });

  it('resolves the resizable flag from the column def and the master switch', () => {
    const s = make({columns: [{id: 'name'}, {id: 'size', resizable: false}]});
    expect(s.columns.value.map((c) => c.resizable)).toEqual([true, false]);
    s.setLayout({resizableColumns: false});
    expect(s.columns.value.map((c) => c.resizable)).toEqual([false, false]);
  });

  it('resizeColumn clamps to min/max, rounds, and skips no-op writes', () => {
    const s = make({columns: [{id: 'name', minWidth: 60, maxWidth: 300}]});
    s.resizeColumn('name', 10);
    expect(s.columns.value[0].width).toBe(60);
    s.resizeColumn('name', 1000);
    expect(s.columns.value[0].width).toBe(300);
    s.resizeColumn('name', 120.4);
    expect(s.columns.value[0].width).toBe(120);
    const before = s.columnSizing.value;
    s.resizeColumn('name', 120.2);
    expect(s.columnSizing.value).toBe(before);
  });

  it('setColumnSizing accepts a record; prop syncs do not echo the callback', () => {
    const onColumnSizingChange = vi.fn();
    const s = make({onColumnSizingChange});
    s.setColumnSizing({name: 200}, true);
    expect(s.columns.value[0].width).toBe(200);
    expect(onColumnSizingChange).not.toHaveBeenCalled();
    s.resetColumn('name');
    expect(onColumnSizingChange).toHaveBeenCalledTimes(1);
    expect(onColumnSizingChange.mock.calls[0][0].size).toBe(0);
  });
});

describe('GridState — drag resize', () => {
  it('pointer down/move/up resizes live and commits once on release', () => {
    const onColumnSizingChange = vi.fn();
    const s = make({onColumnSizingChange});
    const target = pointerTarget();
    s.onResizePointerDown('size', ptr(100, target));
    expect(s.resizing$.value).toBe('size');
    s.onResizePointerMove(ptr(150, target));
    expect(s.columns.value[1].width).toBe(130);
    expect(onColumnSizingChange).not.toHaveBeenCalled();
    s.onResizePointerUp(ptr(140, target));
    expect(s.columns.value[1].width).toBe(120);
    expect(s.resizing$.value).toBe(null);
    expect(onColumnSizingChange).toHaveBeenCalledTimes(1);
    expect(onColumnSizingChange.mock.calls[0][0].get('size')).toBe(120);
  });

  it('clamps to the min width while dragging past it', () => {
    const s = make();
    const target = pointerTarget();
    s.onResizePointerDown('size', ptr(100, target));
    s.onResizePointerMove(ptr(-200, target));
    expect(s.columns.value[1].width).toBe(40);
  });

  it('does not start a drag on a non-resizable column', () => {
    const s = make({resizableColumns: false});
    s.onResizePointerDown('size', ptr(100, pointerTarget()));
    expect(s.resizing$.value).toBe(null);
  });

  it('ends the drag when a move arrives with the button released (swallowed pointer-up)', () => {
    const onColumnSizingChange = vi.fn();
    const s = make({onColumnSizingChange});
    const target = pointerTarget();
    s.onResizePointerDown('size', ptr(100, target));
    s.onResizePointerMove(ptr(150, target));
    expect(s.columns.value[1].width).toBe(130);
    s.onResizePointerMove(ptr(400, target, 0));
    expect(s.resizing$.value).toBe(null);
    expect(onColumnSizingChange).toHaveBeenCalledTimes(1);
    // The released-pointer position is not applied; the last pressed one is.
    expect(s.columns.value[1].width).toBe(130);
    s.onResizePointerMove(ptr(500, target));
    expect(s.columns.value[1].width).toBe(130);
  });

  it('ends the drag when the pointer capture is lost', () => {
    const onColumnSizingChange = vi.fn();
    const s = make({onColumnSizingChange});
    const target = pointerTarget();
    s.onResizePointerDown('size', ptr(100, target));
    s.onResizeLostCapture();
    expect(s.resizing$.value).toBe(null);
    expect(onColumnSizingChange).toHaveBeenCalledTimes(1);
  });

  it('freezes flex columns to their rendered width when a drag starts', () => {
    const s = make({
      columns: [
        {id: 'name', width: 220, flex: 1},
        {id: 'size', width: 80},
      ],
    });
    (s.scroll as any).viewportEl = {
      querySelector: (selector: string) =>
        selector === '[role="columnheader"][data-col="name"]' ? {getBoundingClientRect: () => ({width: 320})} : null,
    };
    const target = pointerTarget();
    s.onResizePointerDown('size', ptr(100, target));
    expect(s.columns.value[0].width).toBe(320);
    expect(s.columns.value[0].flex).toBe(0);
    s.onResizePointerMove(ptr(150, target));
    s.onResizePointerUp(ptr(150, target));
    expect(s.columns.value[0].width).toBe(320);
    expect(s.columns.value[1].width).toBe(130);
  });
});

describe('GridState — keyboard resize', () => {
  it('arrows step, Shift steps large, Home jumps to the min width', () => {
    const onColumnSizingChange = vi.fn();
    const s = make({onColumnSizingChange});
    const width = () => s.columns.value[0].width;
    s.onResizeKeyDown('name', kbd('ArrowRight'));
    expect(width()).toBe(130);
    s.onResizeKeyDown('name', kbd('ArrowRight', {shiftKey: true}));
    expect(width()).toBe(180);
    s.onResizeKeyDown('name', kbd('ArrowLeft'));
    expect(width()).toBe(170);
    s.onResizeKeyDown('name', kbd('Home'));
    expect(width()).toBe(40);
    expect(onColumnSizingChange).toHaveBeenCalledTimes(4);
  });

  it('Escape restores the width at interaction start; blur ends the interaction', () => {
    const s = make();
    const width = () => s.columns.value[0].width;
    s.onResizeKeyDown('name', kbd('ArrowRight'));
    s.onResizeKeyDown('name', kbd('ArrowRight'));
    expect(width()).toBe(140);
    s.onResizeKeyDown('name', kbd('Escape'));
    expect(width()).toBe(120);
    s.onResizeKeyDown('name', kbd('ArrowRight'));
    s.onResizeBlur();
    s.onResizeKeyDown('name', kbd('Escape'));
    expect(width()).toBe(130);
  });
});

const cellPtr = (mods: Partial<{shiftKey: boolean; metaKey: boolean; ctrlKey: boolean; button: number}> = {}) =>
  ({button: 0, shiftKey: false, metaKey: false, ctrlKey: false, preventDefault: () => {}, ...mods}) as any;

const gk = (key: string, mods: Partial<{shiftKey: boolean; metaKey: boolean; ctrlKey: boolean}> = {}) => {
  const target = {};
  return {
    key,
    target,
    currentTarget: target,
    shiftKey: false,
    metaKey: false,
    ctrlKey: false,
    preventDefault: () => {},
    ...mods,
  } as any;
};

const rowOf = (s: GridState<Item>, id: string) => s.rows.value.find((r) => r.id === id)!;
const colOf = (s: GridState<Item>, id: string) => s.columns.value.find((c) => c.id === id)!;
const picked = (s: GridState<Item>) => [...s.selected.value].sort();

describe('GridState — selection', () => {
  it('replace, toggle, and additive range over view order', () => {
    const s = make({selection: 'multi'});
    s.select('bravo');
    expect(picked(s)).toEqual(['bravo']);
    s.select('delta', 'toggle');
    expect(picked(s)).toEqual(['bravo', 'delta']);
    s.select('delta', 'toggle');
    expect(picked(s)).toEqual(['bravo']);
    // View order is the sorted order: alpha, bravo, charlie, delta.
    s.setSorting([{column: 'name', dir: 'asc'}]);
    s.select('alpha');
    s.select('charlie', 'range');
    expect(picked(s)).toEqual(['alpha', 'bravo', 'charlie']);
  });

  it('range keeps the anchor, so repeated Shift-clicks pivot around it', () => {
    const s = make({selection: 'multi'});
    s.setSorting([{column: 'name', dir: 'asc'}]);
    s.select('bravo');
    s.select('delta', 'range');
    expect(picked(s)).toEqual(['bravo', 'charlie', 'delta']);
    s.select('alpha', 'range');
    expect(picked(s)).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    // A replace moves the anchor.
    s.select('charlie');
    s.select('delta', 'range');
    expect(picked(s)).toEqual(['charlie', 'delta']);
  });

  it('single mode replaces, Cmd-toggle deselects, range degrades to replace', () => {
    const s = make({selection: 'single'});
    s.select('bravo');
    s.select('delta');
    expect(picked(s)).toEqual(['delta']);
    s.select('delta', 'toggle');
    expect(picked(s)).toEqual([]);
    s.select('bravo');
    s.select('charlie', 'range');
    expect(picked(s)).toEqual(['charlie']);
  });

  it('is inert when selection is off', () => {
    const s = make();
    s.select('bravo');
    s.selectAll();
    expect(picked(s)).toEqual([]);
  });

  it('caps the selection: toggles no-op, ranges fill from the anchor, selectAll clamps', () => {
    const s = make({selection: 'multi', maxSelected: 2});
    s.select('bravo', 'toggle');
    s.select('alpha', 'toggle');
    s.select('delta', 'toggle');
    expect(picked(s)).toEqual(['alpha', 'bravo']);
    s.setSelected(new Set());
    // Range from alpha in name order: alpha, bravo win; charlie, delta dropped.
    s.setSorting([{column: 'name', dir: 'asc'}]);
    s.select('alpha');
    s.select('delta', 'range');
    expect(picked(s)).toEqual(['alpha', 'bravo']);
    s.setSelected(new Set());
    s.selectAll();
    expect(picked(s)).toEqual(['alpha', 'bravo']);
  });

  it('selectAll, clearSelection, and the tri-state phase', () => {
    const s = make({selection: 'multi'});
    expect(s.selectionPhase.value).toBe('none');
    s.select('bravo');
    expect(s.selectionPhase.value).toBe('some');
    s.selectAll();
    expect(s.selectionPhase.value).toBe('all');
    expect(picked(s)).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    s.clearSelection();
    expect(s.selectionPhase.value).toBe('none');
  });

  it('fires onSelectionChange for user changes, not prop syncs or no-op writes', () => {
    const onSelectionChange = vi.fn();
    const s = make({selection: 'multi', onSelectionChange});
    s.select('bravo');
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(['bravo']);
    s.setSelected(new Set(['bravo']));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    s.setSelected(new Set(['alpha']), true);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('prepends the synthetic checkbox column when enabled', () => {
    const s = make({selection: 'multi', selectionColumn: true});
    const first = s.columns.value[0];
    expect(first.id).toBe('__select__');
    expect(first.index).toBe(0);
    expect(first.width).toBe(32);
    expect(first.sortable).toBe(false);
    expect(first.resizable).toBe(false);
    s.setLayout({selection: 'none'});
    expect(s.columns.value[0].id).toBe('name');
  });

  it('buckets selected rows into rail-map mark fractions', () => {
    const s = make({selection: 'multi'});
    expect(s.selectionMarks.value).toEqual([]);
    s.select('bravo');
    s.select('charlie', 'toggle');
    // bravo is view row 0 of 4, charlie is view row 3 of 4.
    expect(s.selectionMarks.value).toEqual([0.5 / 200, 150.5 / 200]);
  });
});

describe('GridState — header menu', () => {
  it('sortColumn sets, replaces, additively updates, and clears explicitly', () => {
    const s = make();
    s.sortColumn('name', 'asc');
    expect(s.sorting.value).toEqual([{column: 'name', dir: 'asc'}]);
    s.sortColumn('size', 'desc');
    expect(s.sorting.value).toEqual([{column: 'size', dir: 'desc'}]);
    s.sortColumn('name', 'asc', true);
    expect(s.sorting.value).toEqual([
      {column: 'size', dir: 'desc'},
      {column: 'name', dir: 'asc'},
    ]);
    s.sortColumn('size', 'asc', true);
    expect(s.sorting.value).toEqual([
      {column: 'size', dir: 'asc'},
      {column: 'name', dir: 'asc'},
    ]);
    s.sortColumn('name', null);
    expect(s.sorting.value).toEqual([{column: 'size', dir: 'asc'}]);
    s.sortColumn('nope', 'asc');
    expect(s.sorting.value).toEqual([{column: 'size', dir: 'asc'}]);
  });

  it('open/close/toggle keeps one menu at a time; a resize start closes it', () => {
    const s = make();
    s.openHeaderMenu('name');
    expect(s.headerMenu$.value).toBe('name');
    s.openHeaderMenu('size');
    expect(s.headerMenu$.value).toBe('size');
    s.toggleHeaderMenu('size');
    expect(s.headerMenu$.value).toBe(null);
    s.toggleHeaderMenu('name');
    expect(s.headerMenu$.value).toBe('name');
    s.onResizePointerDown('size', ptr(100, pointerTarget()));
    expect(s.headerMenu$.value).toBe(null);
  });

  it('columnMenuItems gates on capabilities and wires the commands', () => {
    const s = make();
    let items = columnMenuItems(s, s.columns.value[0]);
    expect(items.map((i) => i.name)).toEqual(['Sort', 'Auto-fit width']);
    expect(items[0].children?.map((i) => i.name)).toEqual(['Sort ascending', 'Sort descending']);
    items[0].onSelect?.({} as any);
    expect(s.sorting.value).toEqual([{column: 'name', dir: 'asc'}]);
    // Rebuilt while sorted: Clear sort appears in the submenu, the active
    // direction is marked (grouping and child), and selecting it again clears.
    items = columnMenuItems(s, s.columns.value[0]);
    expect(items[0].children?.map((i) => i.name)).toContain('Clear sort');
    expect(items[0].active?.getSnapshot()).toBe(true);
    expect(items[0].children?.[0].active?.getSnapshot()).toBe(true);
    items[0].children?.[0].onSelect?.({} as any);
    expect(s.sorting.value).toEqual([]);
    s.resizeColumn('name', 300);
    items = columnMenuItems(s, s.columns.value[0]);
    items.find((i) => i.name === 'Reset width')?.onSelect?.({} as any);
    expect(s.columnSizing.value.has('name')).toBe(false);
    const inert = make({columns: [{id: 'name', sortable: false, resizable: false}]});
    expect(columnMenuItems(inert, inert.columns.value[0])).toEqual([]);
  });

  /**
   * A fake `pointerover` target inside a cell: `closest` resolves the pill
   * wrapper, the gridcell, and the row the way the real DOM would.
   */
  const hoverTarget = (rowId: string | null, colId: string | null, opts: {inMenu?: boolean; inRow?: boolean} = {}) => {
    const rowEl = rowId === null ? null : {getAttribute: () => rowId};
    const cellEl =
      colId === null
        ? null
        : {
            getAttribute: () => colId,
            closest: () => rowEl,
          };
    return {
      closest: (selector: string) =>
        selector === '[data-grid-cellmenu]'
          ? opts.inMenu
            ? {}
            : null
          : selector === '[role="gridcell"]'
            ? cellEl
            : selector === '[data-row]'
              ? opts.inRow
                ? {}
                : null
              : null,
    };
  };
  const hover = (target: unknown, pointerType = 'mouse') => ({pointerType, target}) as any;

  it('tracks the hovered cell from delegated pointerover and clears on leave', () => {
    const s = make();
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    // Same cell: no-op; another cell: moves.
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    s.onCellsPointerOver(hover(hoverTarget('alpha', 'size')));
    expect(s.hoverCell$.value).toEqual({row: 'alpha', col: 'size'});
    // Outside any cell (the header, the empty area): clears.
    s.onCellsPointerOver(hover(hoverTarget(null, null)));
    expect(s.hoverCell$.value).toBe(null);
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.onCellsPointerLeave();
    expect(s.hoverCell$.value).toBe(null);
  });

  it('ignores touch pointers, unknown/special columns, and the pill itself', () => {
    const s = make({selection: 'multi', selectionColumn: true});
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name'), 'touch'));
    expect(s.hoverCell$.value).toBe(null);
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'nope')));
    expect(s.hoverCell$.value).toBe(null);
    // A specialized column clears an existing hover instead of adopting it.
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.onCellsPointerOver(hover(hoverTarget('bravo', '__select__')));
    expect(s.hoverCell$.value).toBe(null);
    // Targets inside the pill keep the current value.
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.onCellsPointerOver(hover(hoverTarget(null, null, {inMenu: true})));
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
  });

  it('ignores the row-level pointerover Chrome fires when the pill unmounts', () => {
    const s = make();
    // While hovering: a row-level (non-cell) target must not clear the hover.
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.onCellsPointerOver(hover(hoverTarget(null, null, {inRow: true})));
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    // After a dismiss: Chrome retargets the boundary event to the removed
    // pill's parent (the row) — it must not lift the dismiss suppression,
    // or the real pointerover that follows re-shows the pill.
    s.dismissCellMenu();
    s.onCellsPointerOver(hover(hoverTarget(null, null, {inRow: true})));
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    expect(s.hoverCell$.value).toBe(null);
  });

  it('dismissCellMenu hides the pill until the pointer re-enters the cell', () => {
    const s = make();
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.dismissCellMenu();
    expect(s.hoverCell$.value).toBe(null);
    // Still hovering the same cell: suppressed, the pill stays hidden.
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    expect(s.hoverCell$.value).toBe(null);
    // A different cell lifts the suppression...
    s.onCellsPointerOver(hover(hoverTarget('alpha', 'size')));
    expect(s.hoverCell$.value).toEqual({row: 'alpha', col: 'size'});
    // ...and coming back to the dismissed cell shows the pill again.
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    // Leaving the canvas also resets the suppression.
    s.dismissCellMenu();
    s.onCellsPointerLeave();
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    // Dismiss forces through an open-dropdown pin.
    s.hoverPinned = true;
    s.dismissCellMenu();
    expect(s.hoverCell$.value).toBe(null);
    s.hoverPinned = false;
  });

  it('pins hover while a pill dropdown is open; scroll and resize force-clear', () => {
    const s = make();
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.hoverPinned = true;
    s.onCellsPointerOver(hover(hoverTarget('alpha', 'size')));
    s.onCellsPointerLeave();
    expect(s.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    s.onCellsScroll();
    expect(s.hoverCell$.value).toBe(null);
    s.hoverPinned = false;
    s.onCellsPointerOver(hover(hoverTarget('bravo', 'name')));
    s.onResizePointerDown('size', ptr(100, pointerTarget()));
    expect(s.hoverCell$.value).toBe(null);
  });

  it('passes the grid state to the row/cell callbacks', () => {
    const onSelectionChange = vi.fn();
    const onCellFocus = vi.fn();
    const onCellAction = vi.fn();
    const s = make({selection: 'multi', onSelectionChange, onCellFocus, onCellAction});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    expect(onCellFocus.mock.calls[0][3]).toBe(s);
    expect(onSelectionChange.mock.calls[0][1]).toBe(s);
    s.onCellDoubleClick(rowOf(s, 'bravo'), colOf(s, 'name'));
    expect(onCellAction.mock.calls[0][4]).toBe(s);
  });
});

describe('GridState — design polish', () => {
  it('parses the gridlines switch: boolean, and object with per-part overrides', () => {
    const s = make({gridlines: {header: false}});
    expect(s.gridlines$.value).toEqual({header: false, columns: true, rows: true});
    s.setLayout({gridlines: true});
    expect(s.gridlines$.value).toEqual({header: true, columns: true, rows: true});
    s.setLayout({gridlines: false});
    expect(s.gridlines$.value).toEqual({header: false, columns: false, rows: false});
  });

  it('specialized columns get no dividers, on either side', () => {
    const s = make({columns: [{id: 'a'}, {id: 'b', special: true}, {id: 'c'}]});
    expect(s.columns.value.map((c) => c.special)).toEqual([false, true, false]);
    expect(s.columns.value.map((c) => c.divider)).toEqual([false, false, true]);
    const withSelect = make({selection: 'multi', selectionColumn: true});
    expect(withSelect.columns.value[0].divider).toBe(false);
    expect(withSelect.columns.value[1].divider).toBe(true);
  });

  it('prepends the icon column; joined with selection only the select column remains', () => {
    const s = make({iconColumn: true});
    expect(s.columns.value[0].id).toBe('__icon__');
    expect(s.columns.value[0].special).toBe(true);
    const joined = make({selection: 'multi', selectionColumn: true, iconColumn: true});
    expect(joined.columns.value[0].id).toBe('__select__');
    expect(joined.columns.value.some((c) => c.id === '__icon__')).toBe(false);
  });

  it('icon-column cells select the row but never become the active cell', () => {
    const s = make({selection: 'multi', iconColumn: true});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, '__icon__'), cellPtr());
    expect(picked(s)).toEqual(['bravo']);
    expect(s.activeCell.value).toBe(null);
  });

  it('maps the spacing trace to cell padding, feeding auto-fit', () => {
    const s = make();
    expect(s.cellPad$.value).toBe(8);
    s.setLayout({spacing: 1});
    expect(s.cellPad$.value).toBe(16);
    s.setLayout({spacing: 0.75});
    expect(s.cellPad$.value).toBe(12);
    (s.scroll as any).viewportEl = {
      querySelector: () => null,
      querySelectorAll: () => [{children: [{scrollWidth: 150, getAttribute: () => null}]}],
    };
    s.autoFitColumn('name');
    // 150 content + 2 x 12px spacing-derived padding + 1px slack.
    expect(s.columns.value[0].width).toBe(175);
  });
});

describe('GridState — active cell', () => {
  it('pointer down focuses the cell and drives selection with modifiers', () => {
    const s = make({selection: 'multi'});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
    expect(picked(s)).toEqual(['bravo']);
    s.onCellPointerDown(rowOf(s, 'delta'), colOf(s, 'size'), cellPtr({metaKey: true}));
    expect(s.activeCell.value).toEqual({row: 'delta', col: 'size'});
    expect(picked(s)).toEqual(['bravo', 'delta']);
    s.onCellPointerDown(rowOf(s, 'alpha'), colOf(s, 'name'), cellPtr());
    expect(picked(s)).toEqual(['alpha']);
  });

  it('selectOnRowClick: false still focuses but no longer selects', () => {
    const s = make({selection: 'multi', selectOnRowClick: false});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
    expect(picked(s)).toEqual([]);
  });

  it('onCellFocus can veto focus; keyboard navigation skips vetoed cells', () => {
    const onCellFocus = vi.fn((cell) => (cell.col === 'size' ? false : undefined));
    const s = make({selection: 'multi', onCellFocus});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'size'), cellPtr());
    expect(s.activeCell.value).toBe(null);
    expect(picked(s)).toEqual(['bravo']); // The row still selects.
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
    s.onGridKeyDown(gk('ArrowRight'));
    // Skips the vetoed size column and lands on done.
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'done'});
  });

  it('the checkbox column is never focusable and its pointer downs are inert', () => {
    const s = make({selection: 'multi', selectionColumn: true});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, '__select__'), cellPtr());
    expect(s.activeCell.value).toBe(null);
    expect(picked(s)).toEqual([]);
    s.onGridKeyDown(gk('ArrowDown'));
    // The first focusable cell of the first row skips the checkbox column.
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
  });

  it('arrows move within bounds without wrapping', () => {
    const s = make();
    s.onGridKeyDown(gk('ArrowDown'));
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
    s.onGridKeyDown(gk('ArrowDown'));
    expect(s.activeCell.value).toEqual({row: 'alpha', col: 'name'});
    s.onGridKeyDown(gk('ArrowUp'));
    s.onGridKeyDown(gk('ArrowUp'));
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
    s.onGridKeyDown(gk('ArrowLeft'));
    expect(s.activeCell.value).toEqual({row: 'bravo', col: 'name'});
  });

  it('Enter and double-click fire onCellAction with the rendered cell element', () => {
    const onCellAction = vi.fn();
    const el = {tag: 'cell'};
    const s = make({selection: 'multi', onCellAction});
    (s.scroll as any).viewportEl = {
      querySelector: (selector: string) => (selector === '[data-row="bravo"] [data-col="name"]' ? el : null),
    };
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    s.onGridKeyDown(gk('Enter'));
    expect(onCellAction).toHaveBeenCalledTimes(1);
    const [cell, column, row, element] = onCellAction.mock.calls[0];
    expect(cell).toEqual({row: 'bravo', col: 'name'});
    expect(column.id).toBe('name');
    expect(row.id).toBe('bravo');
    expect(element).toBe(el);
    s.onCellDoubleClick(rowOf(s, 'bravo'), colOf(s, 'name'));
    expect(onCellAction).toHaveBeenCalledTimes(2);
  });

  it('Space toggles the active row when selection is on, acts when it is off', () => {
    const onCellAction = vi.fn();
    const s = make({selection: 'multi', onCellAction});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    s.onGridKeyDown(gk(' '));
    expect(picked(s)).toEqual([]);
    s.onGridKeyDown(gk(' '));
    expect(picked(s)).toEqual(['bravo']);
    expect(onCellAction).not.toHaveBeenCalled();
    const off = make({onCellAction});
    off.onGridKeyDown(gk('ArrowDown'));
    off.onGridKeyDown(gk(' '));
    expect(onCellAction).toHaveBeenCalledTimes(1);
  });

  it('Escape clears the active cell first, then the selection; Cmd+A selects all', () => {
    const s = make({selection: 'multi'});
    s.onCellPointerDown(rowOf(s, 'bravo'), colOf(s, 'name'), cellPtr());
    s.onGridKeyDown(gk('a', {metaKey: true}));
    expect(s.selectionPhase.value).toBe('all');
    s.onGridKeyDown(gk('Escape'));
    expect(s.activeCell.value).toBe(null);
    expect(s.selectionPhase.value).toBe('all');
    s.onGridKeyDown(gk('Escape'));
    expect(picked(s)).toEqual([]);
  });

  it('computes the aria-activedescendant id and survives re-sorting', () => {
    const s = make();
    s.onCellPointerDown(rowOf(s, 'charlie'), colOf(s, 'size'), cellPtr());
    expect(s.activeDescendant.value).toBe(`${s.gridId}-3-1`);
    // Sorting moves charlie to view row 2; the id follows.
    s.setSorting([{column: 'name', dir: 'asc'}]);
    expect(s.activeDescendant.value).toBe(`${s.gridId}-2-1`);
  });

  it('ignores keys targeted at interactive descendants', () => {
    const s = make({selection: 'multi'});
    const e = gk('ArrowDown');
    e.target = {};
    s.onGridKeyDown(e);
    expect(s.activeCell.value).toBe(null);
  });
});

describe('GridState — auto-fit', () => {
  it('sizes to the widest measured cell plus padding, skipping the resize handle', () => {
    const onColumnSizingChange = vi.fn();
    const s = make({onColumnSizingChange});
    const cell = (widths: number[], roles: (string | null)[] = []) => ({
      children: widths.map((scrollWidth, i) => ({
        scrollWidth,
        getAttribute: (name: string) => (name === 'role' ? (roles[i] ?? null) : null),
      })),
    });
    (s.scroll as any).viewportEl = {
      querySelector: () => null,
      querySelectorAll: (selector: string) => {
        expect(selector).toBe('[data-col="name"]');
        // Header cell: label + sort arrow + the handle (excluded); two body cells.
        return [cell([90, 20, 10], [null, null, 'separator']), cell([150]), cell([80])];
      },
    };
    s.autoFitColumn('name');
    // Widest is the 150px body cell, plus 2 x 8px cell padding + 1px slack.
    expect(s.columns.value[0].width).toBe(167);
    expect(onColumnSizingChange).toHaveBeenCalledTimes(1);
  });
});
