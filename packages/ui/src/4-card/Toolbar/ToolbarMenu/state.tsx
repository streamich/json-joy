import {OpenPanelState} from '../../ContextMenu/ContextMenu/OpenPanelState';
import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import type {ToolbarMenuProps} from './types';

export class ToolbarMenuState {
  public onclose?: () => void;

  constructor(
    public props: ToolbarMenuProps,
    public openPanel: OpenPanelState = new OpenPanelState(),
  ) {}

  public execute = (item: MenuItem, event: React.MouseEvent): void => {
    const id = item.id ?? item.name;
    this.openPanel.onClick(id);
    if (item.onSelect) {
      item.onSelect(event);
      this.onclose?.();
    }
  };
}
