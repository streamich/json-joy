import * as React from 'react';
import {OpenPanelState} from '../../../4-card/ContextMenu/ContextMenu/OpenPanelState';
import type {MenuItem} from '../../../4-card/StructuralMenu/types';
import {StatefulToolbarMenu, ToolbarMenuState} from '../../../4-card/Toolbar/ToolbarMenu';
import {GRID} from '../constants';
import {useGrid} from '../context';
import type {GridRowModel} from '../types';

/** Whether selecting this item opens a popup (vs firing a terminal action). */
const opensPopup = (item: MenuItem): boolean => !!(item.children?.length || item.pane);

export interface GridCellMenuProps {
  row: GridRowModel;
}

/**
 * Per-row gate for the in-cell hover menu. Every visible row renders one
 * (when a `cellMenu` builder is set); it subscribes to the hovered cell and
 * returns `null` unless the hover is on THIS row — so a hover change costs a
 * few null re-renders instead of re-rendering every row. The pill itself is
 * a plain absolutely-positioned child of the row (no portal): the row is the
 * containing block (`rowClass` is relative), which keeps the row's `:hover`
 * background lit under the pointer and lets the pill escape the cell's
 * `overflow: hidden` — it may overhang the row edges slightly (Notion-style)
 * on dense row heights.
 */
export const GridCellMenu: React.FC<GridCellMenuProps> = ({row}) => {
  const state = useGrid();
  const cell = state.hoverCell$.use();
  const menu = state.cellMenu$.use();
  const columns = state.columns.use();
  if (!menu || !cell || cell.row !== row.id) return null;
  const column = columns.find((c) => c.id === cell.col);
  if (!column || column.special) return null;
  const el = state.cellElement(cell);
  const rowEl = el?.parentElement;
  if (!el || !rowEl) return null;
  const items = menu(cell, column, row, el, state);
  if (!items.length) return null;
  // The pill's right edge sits at the cell's right edge (the row is the
  // cells' offset parent), minus a small inset. Keyed by column so moving
  // along the row remounts the pill (fresh toolbar state per cell).
  const right = rowEl.offsetWidth - (el.offsetLeft + el.offsetWidth) + GRID.CellMenuInset;
  return <GridCellMenuPill key={cell.col} items={items} right={right} />;
};

interface GridCellMenuPillProps {
  items: MenuItem[];
  right: number;
}

/**
 * The pill proper — a compact `ToolbarMenu`. Mounted only for the hovered
 * cell; owns its `ToolbarMenuState` so the open-dropdown pin can watch the
 * panel selection.
 */
const GridCellMenuPill: React.FC<GridCellMenuPillProps> = ({items, right}) => {
  const state = useGrid();
  const reactId = React.useId();
  const toolbar = React.useMemo(() => {
    const toolbar = new ToolbarMenuState({menu: {name: 'Cell actions'}}, reactId);
    // The stock panel is "armed": merely hovering an item force-selects it
    // (hover-to-open). In a pill that is itself hover-revealed that is too
    // aggressive — a pointer pass over any button writes a selection that
    // outlives the hover. Swap in an unarmed panel on the same shared
    // subject + prefix: pill dropdowns open on click only.
    const {openPanel} = toolbar;
    toolbar.openPanel = new OpenPanelState({selected$: openPanel.selected$, prefix: openPanel.prefix});
    return toolbar;
  }, [reactId]);
  // While a pill dropdown is open the pointer can wander (the dropdown
  // portals outside the row canvas), so hover writes are pinned. Pin only
  // when the selection actually opens a popup — clicking a terminal item
  // also writes to the shared `selected$` (with nothing open to dismiss),
  // and pinning on that would freeze hover tracking indefinitely.
  const itemsRef = React.useRef<MenuItem[]>(items);
  itemsRef.current = items;
  React.useEffect(() => {
    const openPanel = toolbar.openPanel;
    const subscription = openPanel.selected$.subscribe((raw) => {
      let pinned = false;
      if (raw && (!openPanel.prefix || raw.startsWith(openPanel.prefix))) {
        const local = raw.slice(openPanel.prefix.length);
        pinned = itemsRef.current.some((item) => (item.id ?? item.name) === local && opensPopup(item));
      }
      state.hoverPinned = pinned;
    });
    return () => {
      // A leftover selection would pin the next pill and render its dropdown
      // pre-opened (all pills share the subject) — deselect ours on the way out.
      openPanel.onClick('');
      subscription.unsubscribe();
      state.hoverPinned = false;
    };
  }, [toolbar, state]);

  // Firing any action (nested dropdown items included) dismisses the pill —
  // suppressed until the pointer re-enters the cell — unless the item sets
  // `keepOpen` (the same contract as the selection and header menus).
  const wrap = (item: MenuItem): MenuItem => ({
    ...item,
    onSelect: item.onSelect
      ? (e: React.MouseEvent | React.TouchEvent) => {
          item.onSelect?.(e);
          if (!item.keepOpen) state.dismissCellMenu();
        }
      : undefined,
    children: item.children?.map(wrap),
  });
  const root: MenuItem = {name: 'Cell actions', children: items.map(wrap)};

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: not an interactive element; only a propagation boundary
    <div
      data-grid-cellmenu
      style={{
        position: 'absolute',
        right,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
      }}
      // The pill is a row child, so without this a pill click would also
      // fire the row's `onRowClick`.
      onClick={(e) => e.stopPropagation()}
    >
      <StatefulToolbarMenu state={toolbar} small pane menu={root} />
    </div>
  );
};
