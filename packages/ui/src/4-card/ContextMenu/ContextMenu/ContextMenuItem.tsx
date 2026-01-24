import * as React from 'react';
import {useT} from 'use-t';
import {ContextItemNested} from '../ContextItemNested';
import {useContextMenu} from './context';
import type {OpenPanelState} from './OpenPanelState';
import {useSyncStoreOpt} from '../../../hooks/useSyncStore';
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

  const id = item.id ?? item.name;
  const children = !!item.children && !!item.children.length ? item.children : void 0;

  return (
    <ContextItemNested
      key={item.id || item.name}
      open={open}
      inset={state.props.inset}
      more={item.more}
      nested={!!children}
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
      right={item.right?.()}
      danger={item.danger}
      onClick={
        item.onSelect
          ? (event) => state.execute(item, event)
          : children
            ? () => {
                state.select(path, item);
              }
            : void 0
      }
      renderPane={!!children && renderPane ? renderPane : void 0}
      onMouseEnter={() => openPanel?.onMouseMove(id)}
      onMouseMove={() => openPanel?.onMouseMove(id)}
      onMouseLeave={openPanel?.onMouseLeave}
    >
      {item.display?.() ?? t(item.name)}
    </ContextItemNested>
  );
};
