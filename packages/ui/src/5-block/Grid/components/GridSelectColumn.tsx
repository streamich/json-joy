import {rule} from 'nano-theme';
import * as React from 'react';
import {Check} from '../../../1-inline/Check';
import {GRID} from '../constants';
import {useGrid} from '../context';
import {cellClass, cellSizeStyle, headerCellClass, rowClass} from '../styles';
import type {GridColumn, GridRowModel} from '../types';

const checkWrapClass = rule({
  d: 'inline-flex',
});

const headerRevealCls = rule({
  d: 'none',
  [`.${headerCellClass.trim()}:hover &`]: {d: 'inline-flex'},
});

/**
 * Header cell of the checkbox selection column: the tri-state "select all"
 * check — unchecked (none), a dash (some — the undecided state), checked
 * (all). Clicking cycles none/some to all and all to none; indeterminate is a
 * reflection of a partial selection, never a click target. Hidden in single
 * mode (select-all is meaningless there) and disabled when `maxSelected`
 * cannot cover every row. When the checkboxes are muted (or the column is
 * joined with the icon column), the check shows only while hovered or while
 * the selection is non-empty.
 */
export const GridSelectHeader: React.FC<{column: GridColumn}> = ({column}) => {
  const state = useGrid();
  const mode = state.selection$.use();
  const phase = state.selectionPhase.use();
  const max = state.maxSelected$.use();
  const rowCount = state.rows.use().length;
  const joined = state.iconColumn$.use() && !!state.opts.icon;
  const muted = joined || state.muteSelection$.use();
  const disabled = max !== undefined && max < rowCount;

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: the inner Check hosts a native focusable checkbox
    <div
      role="columnheader"
      aria-colindex={column.index + 1}
      data-col={column.id}
      className={headerCellClass}
      style={{...cellSizeStyle(column), justifyContent: 'center'}}
    >
      {mode === 'multi' && (
        <span className={muted && phase === 'none' ? headerRevealCls : checkWrapClass}>
          <Check
            size={GRID.SelectCheckSize}
            checked={phase === 'all'}
            indeterminate={phase === 'some'}
            disabled={disabled}
            aria-label="Select all rows"
            onChange={() => (phase === 'all' ? state.clearSelection() : state.selectAll())}
            onClick={(e) => e.stopPropagation()}
          />
        </span>
      )}
    </div>
  );
};

const cellRevealCellScopeCls = rule({
  d: 'none',
  [`.${cellClass.trim()}:hover &`]: {d: 'inline-flex'},
});

const cellRevealRowScopeCls = rule({
  d: 'none',
  [`.${rowClass.trim()}:hover &`]: {d: 'inline-flex'},
});

const iconRestClass = rule({
  d: 'inline-flex',
  lineHeight: '0',
  [`.${cellClass.trim()}:hover &`]: {d: 'none'},
});

export interface GridSelectCellProps {
  row: GridRowModel;
  column: GridColumn;
  selected: boolean;
}

/**
 * Body cell of the checkbox selection column. Checkbox semantics are always
 * toggle — no modifier needed — and Shift extends a range from the anchor.
 * Clicks here never set the active cell and never reach `onRowClick`.
 *
 * Joined with the icon column, the cell shows the row icon at rest and swaps
 * to the checkbox only while this cell itself is hovered (or the row is
 * selected) — hovering elsewhere on the row keeps the icon. With muted
 * checkboxes (no icon), the check appears on row hover / selection.
 */
export const GridSelectCell: React.FC<GridSelectCellProps> = ({row, column, selected}) => {
  const state = useGrid();
  const icon = state.opts.icon;
  const joined = state.iconColumn$.use() && !!icon;
  const muted = joined || state.muteSelection$.use();
  const revealClass = joined ? cellRevealCellScopeCls : cellRevealRowScopeCls;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection goes through the grid container and the native checkbox
    // biome-ignore lint/a11y/useFocusableInteractive: the inner Check hosts a native focusable checkbox
    <div
      role="gridcell"
      aria-colindex={column.index + 1}
      data-col={column.id}
      className={cellClass}
      style={{...cellSizeStyle(column), justifyContent: 'center'}}
      onPointerDown={(e) => state.onCellPointerDown(row, column, e)}
      onClick={(e) => e.stopPropagation()}
    >
      {joined && !selected && (
        <span className={iconRestClass} aria-hidden>
          {icon?.(row.data, row)}
        </span>
      )}
      <span className={muted && !selected ? revealClass : checkWrapClass}>
        <Check
          size={GRID.SelectCheckSize}
          checked={selected}
          aria-label="Select row"
          onChange={(_, e) => {
            const native = e.nativeEvent as {shiftKey?: boolean};
            state.select(row.id, native.shiftKey ? 'range' : 'toggle');
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </span>
    </div>
  );
};
