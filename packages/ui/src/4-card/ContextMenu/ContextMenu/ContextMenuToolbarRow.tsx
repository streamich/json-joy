import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarMenuItemTerminal} from '../../Toolbar/ToolbarMenu/ToolbarMenuItemTerminal';
import {ContextItemNested} from '../ContextItemNested';
import type {OpenPanelState} from './OpenPanelState';
import {ContextMenuPane} from './ContextMenuPane';
import {useContextMenu} from './context';
import {Space} from '../../../3-list-item/Space';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {MoveToViewport} from '../../../utils/popup/MoveToViewport';

export interface ContextMenuToolbarRowProps {
  openPanel: OpenPanelState;
  path: MenuItem[];
  depth: number;
}

export const ContextMenuToolbarRow: React.FC<ContextMenuToolbarRowProps> = ({path, depth, openPanel}) => {
  const parent = path[path.length - 2];
  const item = path[path.length - 1];
  const selected = useBehaviorSubject(openPanel.selected$);
  const state = useContextMenu();

  const id = parent.id ?? parent.name;
  const open = selected === id;
  const buttons: React.ReactNode[] = [];
  const children = item.children;
  const length = children?.length ?? 0;
  const max = Math.min(item.expand ?? 4, 4);

  for (let i = 0; i < length; i++) {
    if (i >= max) break;
    const child = children![i];
    if (child.icon)
      buttons.push(
        <React.Fragment key={child.id || child.name || i}>
          <ToolbarMenuItemTerminal item={child} small fill={!open} />
          <Space horizontal size={-2} />
        </React.Fragment>,
      );
  }

  return (
    <div style={{position: 'relative'}}>
      <ContextItemNested
        key={item.id || item.name}
        open={open}
        inset
        more={item.more}
        nested={!!children}
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
                  state.select(path.slice(0, -2), parent);
                }
              : void 0
        }
        renderPane={() => (
          <MoveToViewport>
            <ContextMenuPane header={void 0} menu={parent} path={[parent]} depth={depth + 1} inset />
          </MoveToViewport>
        )}
        onMouseEnter={() => openPanel.onMouseMove(id)}
        onMouseMove={() => openPanel.onMouseMove(id)}
        onMouseLeave={openPanel.onMouseLeave}
      >
        <div>&nbsp;</div>
      </ContextItemNested>
      <div style={{position: 'absolute', top: 2, left: 8}}>{buttons}</div>
    </div>
  );
};
