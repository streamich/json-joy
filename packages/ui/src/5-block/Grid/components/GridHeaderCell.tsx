import {drule} from 'nano-theme';
import * as React from 'react';
import {ContextMenu} from '../../../4-card/ContextMenu/ContextMenu';
import {context as popupCtx} from '../../../4-card/Popup/context';
import {PopupControlled} from '../../../4-card/Popup/PopupControlled';
import type {MenuItem} from '../../../4-card/StructuralMenu/types';
import {useLockScrolling} from '../../../hooks/useLockScrolling';
import Arrow from '../../../icons/interactive/Arrow';
import {useStyles} from '../../../styles/context';
import {anchorContext, useAnchorPointHandle} from '../../../utils/popup';
import {GRID} from '../constants';
import {useGrid} from '../context';
import {columnMenuItems} from '../menu';
import {columnLabel} from '../state';
import {cellSizeStyle, cellTextClass, headerCellClass, justifyOf, sortBadgeClass} from '../styles';
import type {GridColumn, GridHeaderMenuBuilder, GridSortSpec} from '../types';
import {GridResizeHandle} from './GridResizeHandle';

const sortableClass = drule({
  cur: 'pointer',
  '&:hover': {bg: 'var(--colBgHover)'},
});

export interface GridHeaderCellProps {
  column: GridColumn;
  sort?: GridSortSpec;
  sortIndex: number;
  sortCount: number;
  headerMenu?: boolean | GridHeaderMenuBuilder<any>;
}

/**
 * One header cell: label (with optional icon), sort indicator + multi-sort
 * badge, and the resize handle. Without `headerMenu`, click cycles the sort
 * (Shift-click multi-sorts) as always. With it, click opens a `ContextMenu`
 * popup anchored under the cell — the popup mounts as an invisible zero-size
 * span at the cell's bottom corner, so the cell's flex layout is untouched
 * and the dropdown portals out (no clipping by the scroll area). Shift-click
 * keeps the direct additive-sort fast path.
 */
export const GridHeaderCell: React.FC<GridHeaderCellProps> = ({column, sort, sortIndex, sortCount, headerMenu}) => {
  const state = useGrid();
  const styles = useStyles();
  const gridlines = state.gridlines$.use();
  const openId = state.headerMenu$.use();
  const menuOn = !!headerMenu && !column.special;
  const open = menuOn && openId === column.id;
  // The sticky header scrolls with the content; freeze scrolling so the
  // anchor cannot slide out from under the fixed-position popup.
  useLockScrolling(open);
  const cellRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const pinRight = column.align === 'right';
  const anchorHandle = useAnchorPointHandle({pinX: pinRight ? 'right' : 'left'});
  const close = React.useCallback(() => state.closeHeaderMenu(), [state]);
  const popupContextValue = React.useMemo(() => ({close}), [close]);
  const dim = styles.g(0, 0.55);
  const clickable = menuOn || column.sortable;

  const onClick = clickable
    ? (e: React.MouseEvent) => {
        if (menuOn && !e.shiftKey) {
          state.toggleHeaderMenu(column.id);
          return;
        }
        if (column.sortable) state.sortBy(column.id, e.shiftKey);
      }
    : undefined;

  const renderMenu = () => {
    const builtins = columnMenuItems(state, column);
    const items = typeof headerMenu === 'function' ? headerMenu(column, builtins, state) : builtins;
    // Selecting any item (or nested child) closes the menu after its handler
    // runs; an item sets `keepOpen` to stay (e.g. repeated actions). `raw()`
    // rows have no `onSelect`, so interacting with custom UI never closes.
    const wrap = (item: MenuItem): MenuItem => ({
      ...item,
      onSelect: item.onSelect
        ? (e: React.MouseEvent | React.TouchEvent) => {
            item.onSelect?.(e);
            if (!item.keepOpen) close();
          }
        : undefined,
      children: item.children?.map(wrap),
    });
    const root: MenuItem = {name: columnLabel(column), children: items.map(wrap)};
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: not an interactive element; only a propagation boundary
      <div ref={popupRef} onClick={(e) => e.stopPropagation()}>
        <ContextMenu inset pane={{style: {width: 242}}} menu={root} onClose={close} />
      </div>
    );
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard sorting arrives with the grid-wide keyboard model (stage 4)
    // biome-ignore lint/a11y/useFocusableInteractive: the grid container is the focusable element; cells get a roving tabindex with the keyboard model (stage 4)
    <div
      ref={cellRef}
      role="columnheader"
      aria-colindex={column.index + 1}
      aria-sort={sort ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      aria-haspopup={menuOn ? 'menu' : undefined}
      aria-expanded={menuOn ? open : undefined}
      data-col={column.id}
      className={headerCellClass + (clickable ? sortableClass : '')}
      style={{
        ...cellSizeStyle(column),
        justifyContent: justifyOf(column.align),
        color: dim,
        boxShadow: gridlines.header && column.divider ? `inset -1px 0 ${styles.g(0, 0.06)}` : undefined,
      }}
      onClick={onClick}
    >
      {column.def.icon && (
        <span style={{display: 'inline-flex', flexShrink: 0, marginRight: 2}} aria-hidden>
          {column.def.icon}
        </span>
      )}
      <span className={cellTextClass}>{column.def.header ?? column.id}</span>
      {sort && <Arrow direction={sort.dir === 'asc' ? 'u' : 'd'} size={GRID.SortIconSize} color={dim} />}
      {sort && sortCount > 1 && (
        <span className={sortBadgeClass} style={{background: styles.g(0, 0.08), color: dim}}>
          {sortIndex + 1}
        </span>
      )}
      {menuOn && (
        <popupCtx.Provider value={popupContextValue}>
          <anchorContext.Provider value={anchorHandle}>
            <PopupControlled
              open={open}
              refToggle={anchorHandle.ref}
              style={{position: 'absolute', bottom: 0, width: 0, height: 0, ...(pinRight ? {right: 0} : {left: 0})}}
              onClickAway={(e) => {
                // The dropdown portals out of this subtree, so contains()
                // checks cover both the cell (its own click toggles) and the
                // popup content (custom UI like inputs must not dismiss).
                if (!open || !(e.target instanceof Node)) return;
                if (cellRef.current?.contains(e.target) || popupRef.current?.contains(e.target)) return;
                close();
              }}
              onEsc={close}
              renderContext={renderMenu}
            />
          </anchorContext.Provider>
        </popupCtx.Provider>
      )}
      {column.resizable && <GridResizeHandle column={column} />}
    </div>
  );
};
