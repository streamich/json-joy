import * as React from 'react';
import {useGrid} from '../context';
import {cellClass, cellSizeStyle} from '../styles';
import type {GridColumn, GridRowModel} from '../types';

export interface GridIconCellProps {
  row: GridRowModel;
  column: GridColumn;
}

/**
 * Body cell of the standalone row-icon column. Renders whatever the `icon`
 * renderer returns, centered and unconstrained — `FileIcon` / `DirIcon` have
 * non-square aspects, so the cell imposes no box. Clicking still selects the
 * row; the cell is never the active cell (the column is specialized).
 */
export const GridIconCell: React.FC<GridIconCellProps> = ({row, column}) => {
  const state = useGrid();
  const icon = state.opts.icon;

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: the grid container is the focusable element; specialized cells are never the active cell
    <div
      role="gridcell"
      aria-colindex={column.index + 1}
      data-col={column.id}
      className={cellClass}
      style={{...cellSizeStyle(column), justifyContent: 'center'}}
      onPointerDown={(e) => state.onCellPointerDown(row, column, e)}
    >
      <span style={{display: 'inline-flex', lineHeight: 0}} aria-hidden>
        {icon?.(row.data, row)}
      </span>
    </div>
  );
};
