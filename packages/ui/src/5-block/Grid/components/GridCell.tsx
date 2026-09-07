import * as React from 'react';
import {Check} from '../../../1-inline/Check';
import {useStyles} from '../../../styles/context';
import {toTime} from '../columnTypes';
import {useGrid} from '../context';
import {cellActiveClass, cellClass, cellSizeStyle, cellTextClass, justifyOf} from '../styles';
import type {GridColumn, GridRowModel} from '../types';

/** Default display renderer per {@link GridColumnType}; the editor layer comes later. */
const defaultRender = (column: GridColumn, value: unknown): React.ReactNode => {
  if (value === undefined || value === null) return null;
  switch (column.type) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'bool':
      return <Check checked={!!value} readOnly size={14} />;
    case 'date':
      return new Date(toTime(value)).toLocaleDateString();
    default:
      return String(value);
  }
};

export interface GridCellProps {
  row: GridRowModel;
  column: GridColumn;
  /** Whether this is the grid's active cell. */
  active?: boolean;
}

export const GridCell: React.FC<GridCellProps> = ({row, column, active}) => {
  const state = useGrid();
  const styles = useStyles();
  const gridlines = state.gridlines$.use();
  const value = column.getValue(row.data);
  const custom = column.def.renderCell;
  const content = custom ? custom({value, data: row.data, row, column}) : defaultRender(column, value);

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: the grid container is the focusable element; the active cell is tracked via aria-activedescendant
    <div
      role="gridcell"
      id={state.cellDomId(row.index, column.index)}
      aria-colindex={column.index + 1}
      data-col={column.id}
      className={cellClass + (active ? cellActiveClass : '')}
      title={!custom && typeof value === 'string' ? value : undefined}
      style={{
        ...cellSizeStyle(column),
        justifyContent: justifyOf(column.align),
        color: styles.g(0, 0.82),
        borderRight: gridlines.columns && column.divider ? `1px solid ${styles.g(0, 0.06)}` : undefined,
      }}
      onPointerDown={(e) => state.onCellPointerDown(row, column, e)}
      onDoubleClick={() => state.onCellDoubleClick(row, column)}
    >
      {typeof content === 'string' || typeof content === 'number' ? (
        <span className={cellTextClass}>{content}</span>
      ) : (
        content
      )}
    </div>
  );
};
