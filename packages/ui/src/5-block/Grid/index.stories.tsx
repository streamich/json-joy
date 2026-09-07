import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {DirIcon} from '../../1-inline/DirIcon';
import {Dot} from '../../1-inline/Dot';
import {FileIcon} from '../../1-inline/FileIcon';
import type {MenuItem} from '../../4-card/StructuralMenu/types';
import {Iconista} from '../../icons/Iconista';
import {Grid} from './Grid';
import type {GridState} from './state';
import type {
  GridCellCoord,
  GridColumn,
  GridColumnDef,
  GridRowModel,
  GridSelectionMenuPosition,
  GridSortSpec,
} from './types';

const meta: Meta = {
  title: '5. Block/Grid',
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const frame: React.CSSProperties = {
  width: 720,
};

/** Deterministic pseudo-random stream, so stories render the same every time. */
const rng = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

// --------------------------------------------------- a Things-like collection

interface Thing {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  priority: number;
  done: boolean;
  created: Date;
  updated: Date;
}

const STATUS_DOT = {todo: 'neutral', doing: 'warning', done: 'success'} as const;

const makeThings = (count: number): Thing[] => {
  const random = rng(42);
  const verbs = ['Design', 'Ship', 'Review', 'Refactor', 'Document', 'Prototype', 'Benchmark', 'Debug'];
  const nouns = ['the grid', 'field controls', 'the tree view', 'CRDT sync', 'the scroll area', 'column pinning'];
  const statuses = ['todo', 'doing', 'done'] as const;
  const things: Thing[] = [];
  for (let i = 0; i < count; i++) {
    const created = new Date(2026, 0, 1 + Math.floor(random() * 150));
    things.push({
      id: `thing-${i}`,
      title: `${verbs[Math.floor(random() * verbs.length)]} ${nouns[Math.floor(random() * nouns.length)]} #${i + 1}`,
      status: statuses[Math.floor(random() * 3)],
      priority: Math.floor(random() * 100),
      done: random() > 0.6,
      created,
      updated: new Date(created.getTime() + Math.floor(random() * 30) * 86400000),
    });
  }
  return things;
};

const thingColumns: GridColumnDef<Thing>[] = [
  {id: 'title', header: 'Title', flex: 1, width: 220},
  {
    id: 'status',
    header: 'Status',
    width: 90,
    renderCell: ({value}) => (
      <span style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0}}>
        <Dot color={STATUS_DOT[value as Thing['status']]} size={8} />
        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{String(value)}</span>
      </span>
    ),
  },
  {id: 'priority', header: 'Priority', type: 'number', width: 80},
  {id: 'done', header: 'Done', type: 'bool', width: 60},
  {id: 'created', header: 'Created', type: 'date', width: 110},
  {id: 'updated', header: 'Updated', type: 'date', width: 110},
];

const things = makeThings(200);

/** A Things-like collection: title, status, and typed field columns. */
export const ThingsCollection: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      frame
      style={frame}
      aria-label="Things collection"
    />
  ),
};

// ----------------------------------------------------------------- a file list

interface FileRow {
  name: string;
  size: number | null;
  kind: string;
  modified: Date;
}

const files: FileRow[] = [
  {name: 'node_modules', size: null, kind: 'Folder', modified: new Date(2026, 5, 1)},
  {name: 'src', size: null, kind: 'Folder', modified: new Date(2026, 5, 28)},
  {name: 'package.json', size: 2184, kind: 'JSON', modified: new Date(2026, 5, 27)},
  {name: 'README.md', size: 5620, kind: 'Markdown', modified: new Date(2026, 4, 12)},
  {name: 'tsconfig.json', size: 730, kind: 'JSON', modified: new Date(2026, 2, 3)},
  {name: 'yarn.lock', size: 1048576, kind: 'Lockfile', modified: new Date(2026, 5, 27)},
  {name: 'biome.json', size: 1310, kind: 'JSON', modified: new Date(2026, 1, 17)},
  {name: '.gitignore', size: 220, kind: 'Text', modified: new Date(2025, 10, 2)},
];

const formatSize = (bytes: number | null): string => {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const fileColumns: GridColumnDef<FileRow>[] = [
  {id: 'name', header: 'Name', flex: 1, width: 200},
  {id: 'size', header: 'Size', type: 'number', width: 90, renderCell: ({value}) => formatSize(value as number | null)},
  {id: 'kind', header: 'Kind', width: 100},
  {id: 'modified', header: 'Date Modified', type: 'date', width: 130},
];

/** A file list (Finder-style), sorted by name by default. Empty sizes sink to the bottom on size sort. */
export const FileList: StoryObj = {
  render: () => (
    <Grid<FileRow>
      data={files}
      columns={fileColumns}
      getId={(f) => f.name}
      defaultSorting={[{column: 'name', dir: 'asc'}]}
      height={300}
      frame
      style={{...frame, width: 560}}
      aria-label="Files"
    />
  ),
};

// ------------------------------------------------------------- virtualization

/** 100,000 rows through the ScrollArea virtualizer — only the visible window renders. */
export const HundredThousandRows: StoryObj = {
  render: () => {
    const data = React.useMemo(() => {
      const random = rng(7);
      return Array.from({length: 100_000}, (_, i) => ({
        id: `row-${i}`,
        index: i,
        value: Math.floor(random() * 1_000_000),
        flag: random() > 0.5,
      }));
    }, []);
    const columns = React.useMemo(
      (): GridColumnDef<(typeof data)[number]>[] => [
        {id: 'id', header: 'Id', width: 120},
        {id: 'index', header: 'Index', type: 'number', width: 100},
        {id: 'value', header: 'Value', type: 'number', flex: 1, width: 140},
        {id: 'flag', header: 'Flag', type: 'bool', width: 60},
      ],
      [],
    );
    return (
      <Grid data={data} columns={columns} getId={(r) => r.id} height={420} frame style={{...frame, width: 560}} zebra />
    );
  },
};

// -------------------------------------------------------------------- sorting

/** Multi-column sort: click a header to sort, shift-click to add columns; badges show priority. */
export const MultiSort: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      defaultSorting={[
        {column: 'status', dir: 'asc'},
        {column: 'priority', dir: 'desc'},
      ]}
      frame
      style={frame}
    />
  ),
};

/** Controlled sorting: the sort order lives outside the grid. */
export const ControlledSorting: StoryObj = {
  render: () => {
    const [sorting, setSorting] = React.useState<readonly GridSortSpec[]>([{column: 'priority', dir: 'desc'}]);
    return (
      <div>
        <div style={{marginBottom: 8, font: '13px sans-serif'}}>
          sorting: <code>{JSON.stringify(sorting)}</code>
        </div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          sorting={sorting}
          onSortingChange={setSorting}
          frame
          style={frame}
        />
      </div>
    );
  },
};

// --------------------------------------------------------------- presentation

/** Gridlines, zebra striping, and a compact row height. */
export const GridlinesZebraCompact: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      gridlines
      zebra
      rowHeight={24}
      headerHeight={26}
      frame
      style={frame}
    />
  ),
};

/** 30 columns; the grid pans horizontally, the header pans with it and stays pinned vertically. */
export const ManyColumns: StoryObj = {
  render: () => {
    const columns = React.useMemo(
      (): GridColumnDef<Record<string, number>>[] =>
        Array.from({length: 30}, (_, c) => ({
          id: `col${c}`,
          header: `Column ${c + 1}`,
          type: 'number' as const,
          width: 100,
        })),
      [],
    );
    const data = React.useMemo(() => {
      const random = rng(1234);
      return Array.from({length: 500}, () => {
        const row: Record<string, number> = {};
        for (let c = 0; c < 30; c++) row[`col${c}`] = Math.floor(random() * 10_000);
        return row;
      });
    }, []);
    return <Grid data={data} columns={columns} height={400} frame style={frame} gridlines />;
  },
};

/** The empty state. */
export const Empty: StoryObj = {
  render: () => <Grid<Thing> data={[]} columns={thingColumns} height={200} frame style={{...frame, width: 560}} />,
};

// -------------------------------------------------------------- column resize

const resizeColumns: GridColumnDef<Thing>[] = [
  {id: 'title', header: 'Title', flex: 1, width: 220, minWidth: 120},
  {...thingColumns[1], maxWidth: 160},
  {id: 'priority', header: 'Priority', type: 'number', width: 80, minWidth: 60, maxWidth: 140},
  {id: 'done', header: 'Done', type: 'bool', width: 60, resizable: false},
  {id: 'created', header: 'Created', type: 'date', width: 110},
  {id: 'updated', header: 'Updated', type: 'date', width: 110},
];

/**
 * Drag a header edge to resize its column (Title is `flex` and freezes to a
 * fixed width once resized; Status and Priority have `maxWidth`; Done is not
 * resizable). Double-click an edge to auto-fit the column to its content. The
 * handle is focusable: arrows resize (Shift for larger steps), Home jumps to
 * the min width, End auto-fits, Escape restores.
 */
export const ColumnResizing: StoryObj = {
  render: () => <Grid<Thing> data={things} columns={resizeColumns} getId={(t) => t.id} frame style={frame} gridlines />,
};

/** Controlled column sizing: width overrides live outside the grid, committed on release. */
export const ControlledColumnSizing: StoryObj = {
  render: () => {
    const [sizing, setSizing] = React.useState<ReadonlyMap<string, number>>(new Map());
    return (
      <div>
        <div style={{marginBottom: 8, font: '13px sans-serif', display: 'flex', gap: 8, alignItems: 'center'}}>
          sizing: <code>{JSON.stringify(Object.fromEntries(sizing))}</code>
          <button type="button" onClick={() => setSizing(new Map())}>
            reset
          </button>
        </div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          columnSizing={sizing}
          onColumnSizingChange={setSizing}
          frame
          style={frame}
        />
      </div>
    );
  },
};

// ------------------------------------------------------------------ selection

/**
 * Multi row selection through the rows themselves: click replaces, Cmd/Ctrl
 * -click toggles, Shift-click range-selects from the anchor. Selected rows
 * show as accent marks on the scroll rail (click a mark to jump). Escape
 * clears the active cell, then the selection; Cmd/Ctrl+A selects all.
 */
export const RowSelection: StoryObj = {
  render: () => {
    const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
    return (
      <div>
        <div style={{marginBottom: 8, font: '13px sans-serif'}}>{selected.size} selected</div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          selection="multi"
          selected={selected}
          onSelectionChange={setSelected}
          frame
          style={frame}
        />
      </div>
    );
  },
};

/**
 * The opt-in checkbox column: the header check is tri-state — mounted with a
 * partial `defaultSelected` it starts undecided (a dash); clicking selects all,
 * then clears. Row checks toggle without modifiers; Shift-click on a check
 * range-selects. With `selectOnRowClick={false}` rows select ONLY through the
 * checks — clicking cells just moves the active cell.
 */
export const CheckboxSelection: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      selection="multi"
      selectionColumn
      selectOnRowClick={false}
      defaultSelected={things.slice(0, 12).map((t) => t.id)}
      zebra
      frame
      style={frame}
    />
  ),
};

/** Single selection: the checkbox column reads as a radio rail; Cmd/Ctrl-click (or the check) deselects. */
export const SingleSelection: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      selection="single"
      selectionColumn
      frame
      style={frame}
    />
  ),
};

/**
 * A selection cap: at most 3 rows. Further adds are silent no-ops, ranges fill
 * from the anchor outward, and the header select-all is disabled because it
 * cannot cover every row.
 */
export const MaxSelected: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      selection="multi"
      selectionColumn
      maxSelected={3}
      frame
      style={frame}
    />
  ),
};

/**
 * The active cell and its "enter" action: click a cell (accent ring), move
 * with arrows, press Enter or double-click to act — here a small card anchors
 * to the cell element the callback receives. The Done column vetoes focus via
 * `onCellFocus` returning `false`, so arrows skip it.
 */
export const CellActions: StoryObj = {
  render: () => {
    const [popup, setPopup] = React.useState<{left: number; top: number; text: string} | null>(null);
    return (
      <div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          selection="multi"
          onCellFocus={(cell) => (cell.col === 'done' ? false : undefined)}
          onCellAction={(_cell, column, row, el) => {
            const rect = el?.getBoundingClientRect();
            setPopup(
              rect ? {left: rect.left, top: rect.bottom + 4, text: `${column.id} of "${row.data.title}"`} : null,
            );
          }}
          frame
          style={frame}
        />
        {popup && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: story-local dismissible readout, not a real Popup
          <div
            style={{
              position: 'fixed',
              left: popup.left,
              top: popup.top,
              zIndex: 10,
              padding: '8px 12px',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 6,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              font: '12px sans-serif',
            }}
            onClick={() => setPopup(null)}
          >
            Entered {popup.text} — click to dismiss
          </div>
        )}
      </div>
    );
  },
};

// -------------------------------------------------------------- design polish

const fileIconColumns: GridColumnDef<FileRow>[] = [
  {
    id: 'name',
    header: 'Name',
    flex: 1,
    width: 200,
    icon: <Iconista set="bootstrap" icon="file-earmark" width={14} height={14} />,
  },
  {
    id: 'size',
    header: 'Size',
    type: 'number',
    width: 90,
    icon: <Iconista set="bootstrap" icon="bar-chart" width={14} height={14} />,
    renderCell: ({value}) => formatSize(value as number | null),
  },
  {id: 'kind', header: 'Kind', width: 100, icon: <Iconista set="bootstrap" icon="tag" width={14} height={14} />},
  {
    id: 'modified',
    header: 'Date Modified',
    type: 'date',
    width: 130,
    icon: <Iconista set="bootstrap" icon="clock" width={14} height={14} />,
  },
];

/**
 * The modern light file-list look: borderless (no `frame`), roomier `spacing`,
 * row separators only (`gridlines={{header: false, columns: false}}`), header
 * icons, and the joined leading column — the row icon (`DirIcon` / `FileIcon`)
 * at rest, swapping to the selection checkbox while that cell is hovered or
 * the row is selected; the header check is muted the same way.
 */
export const FilesWithIcons: StoryObj = {
  render: () => (
    <Grid<FileRow>
      data={files}
      columns={fileIconColumns}
      getId={(f) => f.name}
      defaultSorting={[{column: 'name', dir: 'asc'}]}
      selection="multi"
      selectionColumn
      iconColumn
      icon={(f) =>
        f.kind === 'Folder' ? (
          <DirIcon size={14} />
        ) : (
          <FileIcon label={f.name.split('.').pop() ?? 'file'} ext={f.name.split('.').pop()} size={14} />
        )
      }
      spacing={0.75}
      gridlines={{header: false, columns: false}}
      height={320}
      style={{width: 640}}
    />
  ),
};

/** Muted checkboxes without icons: checks appear on row (or header) hover and stay for selected rows. */
export const MutedSelection: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={things}
      columns={thingColumns}
      getId={(t) => t.id}
      selection="multi"
      selectionColumn
      muteSelection
      zebra
      frame
      style={frame}
    />
  ),
};

/**
 * Play with the continuous `spacing` trace (0..1, higher is roomier; `0.5` is
 * the 8px default — the same value can come from an ancestor `spacing` trace
 * instead of the prop) and the row height.
 */
export const Spacing: StoryObj = {
  render: () => {
    const [spacing, setSpacing] = React.useState(0.5);
    const [rowHeight, setRowHeight] = React.useState(28);
    const [headerHeight, setHeaderHeight] = React.useState(28);
    return (
      <div>
        <div style={{display: 'flex', gap: 24, alignItems: 'center', marginBottom: 8, font: '13px sans-serif'}}>
          <label style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            spacing
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              style={{width: 160}}
            />
            <code>{spacing.toFixed(2)}</code> ({Math.round(16 * spacing)}px)
          </label>
          <label style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            row height
            <input
              type="range"
              min={20}
              max={48}
              step={2}
              value={rowHeight}
              onChange={(e) => setRowHeight(Number(e.target.value))}
              style={{width: 120}}
            />
            <code>{rowHeight}px</code>
          </label>
          <label style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            header height
            <input
              type="range"
              min={20}
              max={48}
              step={2}
              value={headerHeight}
              onChange={(e) => setHeaderHeight(Number(e.target.value))}
              style={{width: 120}}
            />
            <code>{headerHeight}px</code>
          </label>
        </div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          spacing={spacing}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          gridlines
          frame
          style={frame}
        />
      </div>
    );
  },
};

/**
 * The opt-in floating selection toolbar (`selectionMenu`): a `ToolbarMenu`
 * hovering centered over the table while rows are selected, showing the
 * selected count next to the returned `MenuItem` actions. The builder is
 * called with the total table state (`GridState`), so actions read the live
 * selection from `state.selected.value`. Firing any action (including a
 * nested "Move to" child) clears the selection — the action consumed it —
 * and the count / close buttons deselect without acting.
 */
export const SelectionMenu: StoryObj = {
  render: () => {
    const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
    const [last, setLast] = React.useState('none yet');
    const [position, setPosition] = React.useState<GridSelectionMenuPosition>('top');
    const menu = React.useCallback((grid: GridState<Thing>): MenuItem[] => {
      const act = (verb: string) => () =>
        setLast(`${verb} ${grid.selected.value.size} rows: ${[...grid.selected.value].join(', ')}`);
      return [
        {
          name: 'Complete',
          icon: () => <Iconista set="bootstrap" icon="check2-circle" width={16} height={16} />,
          onSelect: act('Complete'),
        },
        {
          name: 'Duplicate',
          icon: () => <Iconista set="bootstrap" icon="files" width={16} height={16} />,
          onSelect: act('Duplicate'),
        },
        {
          name: 'Move to',
          icon: () => <Iconista set="bootstrap" icon="folder-symlink" width={16} height={16} />,
          children: [
            {name: 'Inbox', onSelect: act('Move to Inbox:')},
            {name: 'Today', onSelect: act('Move to Today:')},
            {name: 'Someday', onSelect: act('Move to Someday:')},
            {name: 'Archive', onSelect: act('Move to Archive:')},
          ],
        },
        {
          name: 'Delete',
          danger: true,
          icon: () => <Iconista set="bootstrap" icon="trash" width={16} height={16} />,
          onSelect: act('Delete'),
        },
      ];
    }, []);
    return (
      <div>
        <div style={{display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8, font: '13px sans-serif'}}>
          <span>
            last action: <code>{last}</code> ({selected.size} rows selected)
          </span>
          <label style={{display: 'flex', gap: 6, alignItems: 'center'}}>
            position
            <select value={position} onChange={(e) => setPosition(e.target.value as GridSelectionMenuPosition)}>
              {(['top', 'top-left', 'top-right', 'bottom', 'bottom-left', 'bottom-right'] as const).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          selection="multi"
          selectionColumn
          selected={selected}
          onSelectionChange={setSelected}
          selectionMenu={menu}
          selectionMenuPosition={position}
          frame
          style={frame}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------- header menu

/**
 * Header-click context menu, built-ins only (`headerMenu`): clicking a header
 * opens the column menu — sort ascending/descending (the current direction is
 * marked; selecting it again clears), clear sort, auto-fit width, and reset
 * width (once resized). Shift-click still multi-sorts directly.
 */
export const HeaderMenu: StoryObj = {
  render: () => <Grid<Thing> data={things} columns={thingColumns} getId={(t) => t.id} headerMenu frame style={frame} />,
};

/**
 * The Notion-style custom header menu: the builder receives the column, the
 * pre-built default items, and the table state — here a `raw()` title-input
 * row on top, the built-ins spliced in the middle, and custom actions
 * (including a `danger` delete) below.
 */
export const HeaderMenuCustom: StoryObj = {
  render: () => {
    const [last, setLast] = React.useState('none yet');
    const headerMenu = React.useCallback(
      (column: GridColumn<Thing>, menu: MenuItem[], state: GridState<Thing>): MenuItem[] => [
        {
          name: 'column-title',
          raw: () => (
            <div style={{padding: '8px 12px 4px'}}>
              <input
                defaultValue={String(column.def.header ?? column.id)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '4px 8px',
                  border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: 6,
                  font: '13px sans-serif',
                }}
              />
            </div>
          ),
        },
        {name: 'sep-title', sep: true},
        ...menu,
        {name: 'sep-custom', sep: true},
        {
          name: 'Insert left',
          icon: () => <Iconista set="bootstrap" icon="box-arrow-in-left" width={16} height={16} />,
          onSelect: () => setLast(`Insert left of "${column.id}" (${state.columns.value.length} columns)`),
        },
        {
          name: 'Insert right',
          icon: () => <Iconista set="bootstrap" icon="box-arrow-in-right" width={16} height={16} />,
          onSelect: () => setLast(`Insert right of "${column.id}"`),
        },
        {
          name: 'Shuffle title (keeps open)',
          keepOpen: true,
          icon: () => <Iconista set="bootstrap" icon="arrow-repeat" width={16} height={16} />,
          onSelect: () => setLast(`Shuffle ${Math.floor(Math.random() * 1000)} — menu stays open`),
        },
        {
          name: 'Delete property',
          danger: true,
          icon: () => <Iconista set="bootstrap" icon="trash" width={16} height={16} />,
          onSelect: () => setLast(`Delete "${column.id}"`),
        },
      ],
      [],
    );
    return (
      <div>
        <div style={{marginBottom: 8, font: '13px sans-serif'}}>
          last action: <code>{last}</code>
        </div>
        <Grid<Thing>
          data={things}
          columns={thingColumns}
          getId={(t) => t.id}
          headerMenu={headerMenu}
          frame
          style={frame}
        />
      </div>
    );
  },
};

export const CellMenu: StoryObj = {
  render: () => {
    const [last, setLast] = React.useState('none yet');
    const cellMenu = React.useCallback(
      (
        cell: GridCellCoord,
        column: GridColumn<Thing>,
        row: GridRowModel<Thing>,
        _el: HTMLElement | null,
        state: GridState<Thing>,
      ): MenuItem[] => {
        if (column.id === 'status')
          return [
            {
              name: 'Comment',
              icon: () => <Iconista set="bootstrap" icon="chat" width={16} height={16} />,
              onSelect: () => setLast(`Comment on ${row.data.title} status`),
            },
          ];
        if (column.id !== 'title') return [];
        return [
          {
            name: 'Open (keeps the pill)',
            keepOpen: true,
            icon: () => <Iconista set="bootstrap" icon="box-arrow-up-right" width={16} height={16} />,
            onSelect: () => setLast(`Open "${row.data.title}"`),
          },
          {
            name: 'Comment',
            icon: () => <Iconista set="bootstrap" icon="chat" width={16} height={16} />,
            onSelect: () => setLast(`Comment on "${row.data.title}"`),
          },
          {
            name: 'More',
            icon: () => <Iconista set="bootstrap" icon="three-dots" width={16} height={16} />,
            children: [
              {
                name: 'Copy title',
                icon: () => <Iconista set="bootstrap" icon="clipboard" width={16} height={16} />,
                onSelect: () => setLast(`Copy "${row.data.title}" (cell ${cell.row}/${cell.col})`),
              },
              {
                name: 'Delete',
                danger: true,
                icon: () => <Iconista set="bootstrap" icon="trash" width={16} height={16} />,
                onSelect: () => setLast(`Delete "${row.data.title}" (${state.rows.value.length} rows)`),
              },
            ],
          },
        ];
      },
      [],
    );
    return (
      <div>
        <div style={{marginBottom: 8, font: '13px sans-serif'}}>
          last action: <code>{last}</code>
        </div>
        <Grid<Thing> data={things} columns={thingColumns} getId={(t) => t.id} cellMenu={cellMenu} frame style={frame} />
      </div>
    );
  },
};

const manyThings = makeThings(100_000);

/**
 * Selection at scale: 100k rows. Select all through the header check or
 * Cmd/Ctrl+A — the rail map buckets a hundred thousand selected rows into at
 * most 200 marks.
 */
export const SelectAllStress: StoryObj = {
  render: () => (
    <Grid<Thing>
      data={manyThings}
      columns={thingColumns}
      getId={(t) => t.id}
      selection="multi"
      selectionColumn
      gridlines
      frame
      style={frame}
    />
  ),
};
