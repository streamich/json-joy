import * as React from 'react';
import {useStyles} from '../../../styles/context';
import {GRID_SELECT_COL} from '../constants';
import {useGrid} from '../context';
import {headerClass} from '../styles';
import type {GridHeaderMenuBuilder} from '../types';
import {GridHeaderCell} from './GridHeaderCell';
import {GridSelectHeader} from './GridSelectColumn';

export interface GridHeaderProps {
  /** Header-click context menu mode; see `GridProps.headerMenu`. */
  headerMenu?: boolean | GridHeaderMenuBuilder<any>;
}

/**
 * The sticky header row. Sits in normal flow before the row canvas and pins to
 * the top of the scroll viewport; the grid registers its height as the
 * ScrollArea header height so the windowing math accounts for it. Click sorts a
 * column (shift-click for multi-sort) or, in `headerMenu` mode, opens the
 * column context menu.
 */
export const GridHeader: React.FC<GridHeaderProps> = ({headerMenu}) => {
  const state = useGrid();
  const styles = useStyles();
  const columns = state.columns.use();
  const sorting = state.sorting.use();
  const headerHeight = state.headerHeight$.use();

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: the grid container is the focusable element; cells get a roving tabindex with the keyboard model (stage 4)
    <div
      role="row"
      aria-rowindex={1}
      className={headerClass}
      style={{
        height: headerHeight,
        background: styles.bg + '',
        borderBottom: `1px solid ${styles.g(0, 0.12)}`,
      }}
    >
      {columns.map((column) => {
        if (column.id === GRID_SELECT_COL) return <GridSelectHeader key={column.id} column={column} />;
        const sortIndex = sorting.findIndex((s) => s.column === column.id);
        return (
          <GridHeaderCell
            key={column.id}
            column={column}
            sort={sortIndex >= 0 ? sorting[sortIndex] : undefined}
            sortIndex={sortIndex}
            sortCount={sorting.length}
            headerMenu={headerMenu}
          />
        );
      })}
    </div>
  );
};
