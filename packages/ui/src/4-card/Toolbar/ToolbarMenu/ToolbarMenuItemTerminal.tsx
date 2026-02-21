import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarItem} from '../ToolbarItem';
import {usePopup} from '../../Popup/context';
import {useToolbarMenu} from './context';
import {useSyncStoreOpt} from '../../../hooks/useSyncStore';

export interface ToolbarMenuItemTerminalProps {
  item: MenuItem;
  small?: boolean;
  outline?: boolean;
  fill?: boolean;
  disabled?: boolean;
}

export const ToolbarMenuItemTerminal: React.FC<ToolbarMenuItemTerminalProps> = ({
  item,
  small,
  outline,
  fill,
  disabled,
}) => {
  const popup = usePopup();
  const toolbar = useToolbarMenu();
  const openPanel = toolbar?.openPanel;
  const isTerminal = !item.children || item.children.length === 0;
  const active = !!useSyncStoreOpt(item.active);
  const disabled_ = !!useSyncStoreOpt(item.disabled);

  disabled = disabled || disabled_;

  if (!isTerminal) return null;

  const id = item.id ?? item.name;

  return (
    <ToolbarItem
      small={small}
      outline={outline}
      fill={fill}
      disabled={disabled}
      selected={active}
      onMouseEnter={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
      onMouseMove={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
      onMouseLeave={disabled ? void 0 : openPanel?.onMouseLeave}
      onClick={
        disabled
          ? void 0
          : (event) => {
              popup?.close();
              toolbar?.execute(item, event);
            }
      }
      tooltip={{
        shortcut: item.keys?.join(''),
        renderTooltip: () => item.name ?? item.id ?? '',
      }}
    >
      {item.icon?.()}
    </ToolbarItem>
  );
};
