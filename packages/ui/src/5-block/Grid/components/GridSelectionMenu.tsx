import {rule} from 'nano-theme';
import * as React from 'react';
import {BasicButton} from '../../../2-inline-block/BasicButton';
import {BasicButtonClose} from '../../../2-inline-block/BasicButton/BasicButtonClose';
import {BasicTooltip} from '../../../4-card/BasicTooltip';
import type {MenuItem} from '../../../4-card/StructuralMenu/types';
import {ToolbarMenu} from '../../../4-card/Toolbar/ToolbarMenu';
import {ToolbarSep} from '../../../4-card/Toolbar/ToolbarSep';
import {useStyles} from '../../../styles/context';
import type {AnchorPointComputeSpec} from '../../../utils/popup';
import {useGrid} from '../context';
import type {GridState} from '../state';
import type {GridSelectionMenuPosition} from '../types';

/** The ToolbarItem tooltip anchoring, so custom buttons match the menu items. */
const tooltipAnchor: AnchorPointComputeSpec = {center: true, gap: 8, topIf: 64};

const blockClass = rule({
  pos: 'absolute',
  z: 4,
  isolation: 'isolate',
});

const anchorStyle = (position: GridSelectionMenuPosition, headerHeight: number): React.CSSProperties => {
  switch (position) {
    case 'top-left':
      return {bottom: 'calc(100% + 8px)', left: 0};
    case 'top-right':
      return {bottom: 'calc(100% + 8px)', right: 0};
    case 'bottom':
      return {bottom: 8, left: '50%', transform: 'translateX(-50%)'};
    case 'bottom-left':
      return {bottom: 8, left: 8};
    case 'bottom-right':
      return {bottom: 8, right: 8};
    default:
      return {top: headerHeight + 8, left: '50%', transform: 'translateX(-50%)'};
  }
};

const countStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  paddingInline: 8,
};

export interface GridSelectionMenuProps {
  /**
   * Builds the action items from the total table state — read the live
   * selection inside an action from `state.selected.value`.
   */
  menu: (state: GridState<any>) => MenuItem[];
  /** Anchor inside the grid box. Default `'top'` (centered, below the header). */
  position?: GridSelectionMenuPosition;
}

/**
 * The floating selection toolbar: a `ToolbarMenu` hovering over the top of
 * the table, centered, just below the header. Appears only while at least
 * one row is selected, and only when the caller opts in by providing the
 * action-items builder; the selected-row count renders before the actions.
 * The builder re-runs on every selection change with the {@link GridState},
 * and the selection clears only after an action's `onSelect` runs, so
 * actions read `state.selected.value` for the rows they consume.
 */
export const GridSelectionMenu: React.FC<GridSelectionMenuProps> = ({menu, position = 'top'}) => {
  const state = useGrid();
  const styles = useStyles();
  const count = state.selected.use().size;
  const headerHeight = state.headerHeight$.use();

  const items = count ? menu(state) : [];
  const wrap = (item: MenuItem): MenuItem => ({
    ...item,
    onSelect: item.onSelect
      ? (e: React.MouseEvent | React.TouchEvent) => {
          item.onSelect?.(e);
          if (!item.keepOpen) state.clearSelection();
        }
      : undefined,
    children: item.children?.map(wrap),
  });
  const root: MenuItem = {name: 'Selection actions', children: items.map(wrap)};

  if (!count || !items.length) return null;

  return (
    <div className={blockClass} style={anchorStyle(position, headerHeight)}>
      <ToolbarMenu
        pane
        menu={root}
        before={
          <BasicTooltip anchor={tooltipAnchor} renderTooltip={() => 'Deselect all'}>
            <BasicButton
              rounder
              transparent
              width="auto"
              height={32}
              onClick={() => state.clearSelection()}
              style={{...countStyle, color: styles.g(0, 0.55) + ''}}
            >
              {count} selected
            </BasicButton>
          </BasicTooltip>
        }
        after={
          <>
            <ToolbarSep line />
            <BasicTooltip anchor={tooltipAnchor} renderTooltip={() => 'Deselect all'}>
              <BasicButtonClose
                skewed
                width={32}
                height={32}
                aria-label="Deselect all"
                onClick={() => state.clearSelection()}
              />
            </BasicTooltip>
          </>
        }
      />
    </div>
  );
};
