import * as React from 'react';
import {Marker, ScrollArea, ScrollRail, Thumb, useVirtual} from '../../4-card/ScrollArea';
import {useSpacingTrace} from '../../context/traces';
import {useStyles} from '../../styles/context';
import {GridBodyRow} from './components/GridBodyRow';
import {GridHeader} from './components/GridHeader';
import {GridSelectionMenu} from './components/GridSelectionMenu';
import {GRID} from './constants';
import {ctx} from './context';
import {GridState} from './state';
import {contentClass, emptyClass, gridWrapClass, scrollerClass} from './styles';
import type {GridProps, GridStateOpts} from './types';

const toOpts = <R,>(props: GridProps<R>): GridStateOpts<R> => ({
  data: props.data,
  columns: props.columns,
  getId: props.getId,
  sorting: props.sorting ?? props.defaultSorting,
  columnSizing: props.columnSizing ?? props.defaultColumnSizing,
  resizableColumns: props.resizableColumns,
  rowHeight: props.rowHeight,
  headerHeight: props.headerHeight,
  gridlines: props.gridlines,
  zebra: props.zebra,
  spacing: props.spacing,
  icon: props.icon,
  iconColumn: props.iconColumn,
  muteSelection: props.muteSelection,
  selection: props.selection,
  selected: props.selected ?? props.defaultSelected,
  maxSelected: props.maxSelected,
  selectionColumn: props.selectionColumn,
  selectOnRowClick: props.selectOnRowClick,
  activeCell: props.activeCell ?? props.defaultActiveCell,
  onSortingChange: props.onSortingChange,
  onColumnSizingChange: props.onColumnSizingChange,
  onRowClick: props.onRowClick,
  onSelectionChange: props.onSelectionChange,
  onActiveCellChange: props.onActiveCellChange,
  onCellFocus: props.onCellFocus,
  onCellAction: props.onCellAction,
});

/**
 * Virtualized data grid — typed columns over a flat row source. Composes the
 * headless {@link GridState} (column pipeline: order, visibility, size; row
 * pipeline: sort, flatten) with the ScrollArea native-scroll virtualizer
 * (uniform fixed-row-height fast path, same as `<Tree>`) and a sticky header
 * with click-to-sort. Sorting is controlled OR uncontrolled.
 */
export const Grid = <R,>(props: GridProps<R>): React.ReactElement => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: state is created once; props are synced via effects below.
  const state = React.useMemo(() => props.state ?? new GridState<R>(toOpts(props)), []);
  const styles = useStyles();
  const spacing = useSpacingTrace(props.spacing ?? 0.5);

  React.useLayoutEffect(() => {
    state.setData(props.data);
  }, [state, props.data]);
  React.useLayoutEffect(() => {
    state.setColumns(props.columns);
  }, [state, props.columns]);
  React.useLayoutEffect(() => {
    state.setLayout({
      rowHeight: props.rowHeight,
      headerHeight: props.headerHeight,
      gridlines: props.gridlines,
      zebra: props.zebra,
      spacing,
      resizableColumns: props.resizableColumns,
      selection: props.selection,
      selectionColumn: props.selectionColumn,
      maxSelected: props.maxSelected,
      iconColumn: props.iconColumn,
      muteSelection: props.muteSelection,
    });
  }, [
    state,
    props.rowHeight,
    props.headerHeight,
    props.gridlines,
    props.zebra,
    spacing,
    props.resizableColumns,
    props.selection,
    props.selectionColumn,
    props.maxSelected,
    props.iconColumn,
    props.muteSelection,
  ]);

  // Controlled sorting / sizing / selection: sync the prop to state without echoing the callback.
  React.useLayoutEffect(() => {
    if (props.sorting !== undefined) state.setSorting(props.sorting, true);
  }, [state, props.sorting]);
  React.useLayoutEffect(() => {
    if (props.columnSizing !== undefined) state.setColumnSizing(props.columnSizing, true);
  }, [state, props.columnSizing]);
  React.useLayoutEffect(() => {
    if (props.selected !== undefined) state.setSelected(new Set(props.selected), true);
  }, [state, props.selected]);
  React.useLayoutEffect(() => {
    if (props.activeCell !== undefined) state.setActiveCell(props.activeCell, true);
  }, [state, props.activeCell]);
  // Rows render the hover pill themselves; mirror the builder into state.
  React.useLayoutEffect(() => {
    state.cellMenu$.next(props.cellMenu ?? null);
  }, [state, props.cellMenu]);

  React.useLayoutEffect(() => state.start(), [state]);

  const rows = state.rows.use();
  const columns = state.columns.use();
  const totalWidth = state.totalWidth.use();
  const rowHeight = state.rowHeight$.use();
  const cellPad = state.cellPad$.use();
  const selectionMode = state.selection$.use();
  const activeDescendant = state.activeDescendant.use();
  const selectionMarks = state.selectionMarks.use();
  const overscan = props.overscan ?? GRID.Overscan;
  const showMarkers = selectionMode !== 'none' && props.selectionMarkers !== false;

  const v = useVirtual(state.scroll, {count: rows.length, rowHeight, overscan});
  React.useLayoutEffect(() => {
    state.window = v.window;
    return () => {
      state.window = null;
    };
  }, [state, v.window]);

  const slice: React.ReactNode[] = [];
  for (let i = v.range.start; i <= v.range.end; i++) {
    const row = rows[i];
    if (row) slice.push(<GridBodyRow key={row.id} row={row} />);
  }

  // The top-left / top-right selection-menu anchors sit OUTSIDE the table,
  // above its top edge — those need a relatively-positioned wrapper carrying
  // the user sizing, so the menu aligns to the table's true edges and escapes
  // the scroll area's clipping.
  const menuPosition = props.selectionMenuPosition ?? 'top';
  const menuOutside = menuPosition === 'top-left' || menuPosition === 'top-right';
  const menuNode = props.selectionMenu ? (
    <GridSelectionMenu menu={props.selectionMenu} position={menuPosition} />
  ) : null;
  const frameStyle = props.frame
    ? {border: `1px solid ${styles.g(0, 0.12)}`, borderRadius: 8, overflow: 'hidden' as const}
    : null;

  const scrollArea = (
    <ScrollArea
      state={state.scroll}
      className={menuOutside ? undefined : props.className}
      style={
        menuOutside
          ? {height: '100%', ...frameStyle}
          : {height: props.height ?? GRID.Height, ...frameStyle, ...props.style}
      }
    >
      <div className={gridWrapClass}>
        <div
          ref={state.setViewport}
          className={scrollerClass}
          role="grid"
          tabIndex={0}
          aria-label={props['aria-label']}
          aria-rowcount={rows.length + 1}
          aria-colcount={columns.length}
          aria-multiselectable={selectionMode === 'multi' || undefined}
          aria-activedescendant={activeDescendant}
          onKeyDown={state.onGridKeyDown}
          onScroll={props.cellMenu ? state.onCellsScroll : undefined}
        >
          <div
            className={contentClass}
            style={{minWidth: totalWidth, '--jj-grid-pad': `${cellPad}px`} as React.CSSProperties}
            onPointerOver={props.cellMenu ? state.onCellsPointerOver : undefined}
            onPointerLeave={props.cellMenu ? state.onCellsPointerLeave : undefined}
          >
            <GridHeader headerMenu={props.headerMenu} />
            <div style={{position: 'relative', height: v.totalHeight}}>
              <div style={{transform: `translateY(${v.offsetTop}px)`}}>{slice}</div>
            </div>
            {!rows.length && (
              <div className={emptyClass} style={{color: styles.g(0, 0.4)}}>
                {props.emptyText ?? 'No rows'}
              </div>
            )}
          </div>
        </div>
        {!menuOutside && menuNode}
      </div>
      <ScrollRail>
        <Thumb />
        {showMarkers &&
          selectionMarks.map((fraction) => (
            <Marker
              key={fraction}
              position={fraction}
              height={2}
              color={props.selectionMarkerColor ?? styles.accent + ''}
              onClick={() => state.scrollToFraction(fraction)}
            />
          ))}
      </ScrollRail>
    </ScrollArea>
  );

  return (
    <ctx.Provider value={state as GridState<unknown>}>
      {menuOutside ? (
        <div
          className={props.className}
          style={{position: 'relative', height: props.height ?? GRID.Height, ...props.style}}
        >
          {menuNode}
          {scrollArea}
        </div>
      ) : (
        scrollArea
      )}
    </ctx.Provider>
  );
};
