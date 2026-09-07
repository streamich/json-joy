import {drule} from 'nano-theme';
import * as React from 'react';
import {useStyles} from '../../../styles/context';
import {GRID_ICON_COL, GRID_SELECT_COL} from '../constants';
import {useGrid} from '../context';
import {rowClass} from '../styles';
import {GridCell} from './GridCell';
import {GridCellMenu} from './GridCellMenu';
import {GridIconCell} from './GridIconCell';
import {GridSelectCell} from './GridSelectColumn';
import type {GridRowModel} from '../types';

const rowBgBuilder = drule({});

export interface GridBodyRowProps {
  row: GridRowModel;
}

/**
 * One data row. Reads all view-state and config from the {@link useGrid}
 * context; takes only the row (genuinely instance-local data) as a prop.
 */
const GridBodyRowImpl: React.FC<GridBodyRowProps> = ({row}) => {
  const state = useGrid();
  const styles = useStyles();
  const columns = state.columns.use();
  const rowHeight = state.rowHeight$.use();
  const gridlines = state.gridlines$.use();
  const zebra = state.zebra$.use();
  const selectionOn = state.selection$.use() !== 'none';
  const selectedSet = state.selected.use();
  const selected = selectionOn && selectedSet.has(row.id);
  const activeCell = state.activeCell.use();
  const activeCol = activeCell && activeCell.row === row.id ? activeCell.col : null;
  const cellMenuOn = state.cellMenuOn$.use();
  const onRowClick = state.opts.onRowClick;

  const accent = styles.accent + '';
  const zebraBg = zebra && row.index % 2 === 1 ? styles.g(0, 0.03) : undefined;
  const bgClass = rowBgBuilder({
    // Selected beats zebra; hover deepens whichever is showing.
    bg: selected ? `color-mix(in srgb, ${accent} 10%, transparent)` : (zebraBg ?? 'transparent'),
    '&:hover': {bg: selected ? `color-mix(in srgb, ${accent} 15%, transparent)` : styles.g(0, 0.05)},
  });

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard row activation goes through the grid container's keyboard model
    // biome-ignore lint/a11y/useFocusableInteractive: the grid container is the focusable element; the active cell is tracked via aria-activedescendant
    <div
      role="row"
      aria-rowindex={row.index + 2}
      aria-selected={selectionOn ? selected : undefined}
      data-row={row.id}
      className={rowClass + bgClass}
      style={{
        height: rowHeight,
        boxShadow: gridlines.rows ? `inset 0 -1px ${styles.g(0, 0.06)}` : undefined,
      }}
      onClick={onRowClick ? (e) => onRowClick(row, e, state) : undefined}
    >
      {columns.map((column) =>
        column.id === GRID_SELECT_COL ? (
          <GridSelectCell key={column.id} row={row} column={column} selected={selected} />
        ) : column.id === GRID_ICON_COL ? (
          <GridIconCell key={column.id} row={row} column={column} />
        ) : (
          <GridCell key={column.id} row={row} column={column} active={activeCol === column.id} />
        ),
      )}
      {cellMenuOn && <GridCellMenu row={row} />}
    </div>
  );
};

export const GridBodyRow = React.memo(GridBodyRowImpl);
