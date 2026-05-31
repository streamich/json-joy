import * as React from 'react';
import {useT} from 'use-t';
import {ContextItemNested} from '../ContextItemNested';
import {useContextMenu} from './context';
import type {OpenPanelState} from './OpenPanelState';
import {useSyncStoreOpt} from '../../../hooks/useSyncStore';
import {ArgsPane} from '../ArgsPane';
import {MoveToViewport} from '../../../utils/popup/MoveToViewport';
import type {MenuItem} from '../../StructuralMenu/types';

export interface ContextMenuItemProps {
  item: MenuItem;
  path: MenuItem[];
  parent: MenuItem;
  open: boolean;
  openPanel?: OpenPanelState;
  renderPane?: () => React.ReactNode;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = (props) => {
  const {item, path, open, openPanel, renderPane} = props;
  const [t] = useT();
  const state = useContextMenu();
  const active = !!useSyncStoreOpt(item.active);
  const disabled = !!useSyncStoreOpt(item.disabled);
  const visibleStore = useSyncStoreOpt(item.visible);
  if (item.visible && visibleStore === false) return null;

  const id = item.id ?? item.name;
  const children = item.children && item.children.length ? item.children : void 0;
  const hasPane = !!item.pane;
  const hasPanel = !!item.panel;
  const hasArgs = !!item.params?.length;
  const popupArgs = hasArgs && !!item.popupArgs;
  const display = item.display?.() ?? t(item.name);

  if (item.raw) return item.raw();

  const popupArgsRenderPane = popupArgs
    ? () => (
        <MoveToViewport>
          <ArgsPane
            item={item}
            params={item.params!}
            minWidth={item.minWidth}
            onCancel={() => openPanel?.deselect()}
            onSubmit={
              item.onSubmit
                ? (list, map) => {
                    item.onSubmit?.(list, map);
                    state.onclose?.();
                  }
                : undefined
            }
            onChange={item.onChange}
          />
        </MoveToViewport>
      )
    : undefined;

  const showsPopup = !!children || hasPane || popupArgs || hasPanel;

  return (
    <div data-menu-row data-menu-id={id}>
      <ContextItemNested
        key={item.id || item.name}
        open={open}
        inset={state.props.inset}
        more={item.more}
        nested={showsPopup}
        selected={active}
        disabled={disabled}
        icon={
          item.icon?.() ??
          (item.iconBig ? (
            <div style={{transformOrigin: '0 0', transform: 'scale(.25)'}}>{item.iconBig?.()}</div>
          ) : (
            void 0
          ))
        }
        right={item.control?.() ?? item.right?.()}
        control={!!item.control}
        danger={item.danger}
        mono={item.mono}
        onClick={
          popupArgs
            ? () => openPanel?.forceSelect(id)
            : hasArgs
              ? () => {
                  state.selectArgs(path, item);
                }
              : hasPanel
                ? () => {
                    state.select(path, item);
                  }
                : hasPane
                  ? () => {
                      state.select(path, item);
                    }
                  : item.onSelect
                    ? (event) => state.execute(item, event)
                    : children
                      ? () => {
                          state.select(path, item);
                        }
                      : void 0
        }
        onMouseDown={item.onMouseDown}
        renderPane={popupArgsRenderPane ?? (showsPopup && renderPane ? renderPane : void 0)}
        onMouseEnter={() => openPanel?.onMouseMove(id)}
        onMouseMove={() => openPanel?.onMouseMove(id)}
        onMouseLeave={openPanel?.onMouseLeave}
        role="menuitem"
        tabIndex={-1}
        aria-haspopup={showsPopup ? 'menu' : undefined}
        aria-expanded={showsPopup ? open : undefined}
        aria-disabled={disabled || undefined}
      >
        {display}
      </ContextItemNested>
    </div>
  );
};
