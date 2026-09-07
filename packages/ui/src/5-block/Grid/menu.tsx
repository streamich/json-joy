import ResetWidthIcon__svg from 'iconista/lib/react/bootstrap/arrow-counterclockwise';
import SortIcon__svg from 'iconista/lib/react/bootstrap/arrow-down-up';
import AutoFitIcon__svg from 'iconista/lib/react/bootstrap/arrows-angle-contract';
import SortAscIcon__svg from 'iconista/lib/react/bootstrap/sort-alpha-down';
import SortDescIcon__svg from 'iconista/lib/react/bootstrap/sort-alpha-up';
import ClearSortIcon__svg from 'iconista/lib/react/bootstrap/x-circle';
import * as React from 'react';
import type {MenuItem} from '../../4-card/StructuralMenu/types';
import type {GridState} from './state';
import type {GridColumn} from './types';

/** A constant "on" store for marking the current sort direction as active. */
const on: NonNullable<MenuItem['active']> = {
  subscribe: () => () => {},
  getSnapshot: () => true,
};

const icon = (Svg: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element) => () => <Svg width={16} height={16} />;

/**
 * The built-in column header-menu items.
 */
export const columnMenuItems = <R,>(state: GridState<R>, column: GridColumn<R>): MenuItem[] => {
  const items: MenuItem[] = [];
  const spec = state.sorting.value.find((s) => s.column === column.id);
  if (column.sortable) {
    const sortItem = {
      name: 'Sort',
      icon: icon(SortIcon__svg),
      active: spec?.dir === 'asc' ? on : undefined,
      onSelect: () => state.sortColumn(column.id, spec?.dir === 'asc' ? null : 'asc'),
      children: [
        {
          name: 'Sort ascending',
          icon: icon(SortAscIcon__svg),
          active: spec?.dir === 'asc' ? on : undefined,
          onSelect: () => state.sortColumn(column.id, spec?.dir === 'asc' ? null : 'asc'),
        },
        {
          name: 'Sort descending',
          icon: icon(SortDescIcon__svg),
          active: spec?.dir === 'desc' ? on : undefined,
          onSelect: () => state.sortColumn(column.id, spec?.dir === 'desc' ? null : 'desc'),
        },
      ] as MenuItem[],
    } satisfies MenuItem;
    items.push(sortItem);
    if (spec) {
      sortItem.children.push({
        sepBefore: true,
        name: 'Clear sort',
        icon: icon(ClearSortIcon__svg),
        onSelect: () => state.sortColumn(column.id, null),
      } as MenuItem);
    }
  }
  if (column.resizable) {
    items.push({
      name: 'Auto-fit width',
      icon: icon(AutoFitIcon__svg),
      onSelect: () => state.autoFitColumn(column.id),
    });
    if (state.columnSizing.value.has(column.id)) {
      items.push({
        name: 'Reset width',
        icon: icon(ResetWidthIcon__svg),
        onSelect: () => state.resetColumn(column.id),
      });
    }
  }
  return items;
};
