import * as React from 'react';
import {OpenPanelState} from '../../ContextMenu/ContextMenu/OpenPanelState';
import {BehaviorSubject} from 'rxjs';
import type {MenuItem} from '../../StructuralMenu/types';
import type {ToolbarMenuProps} from './types';

const selected$ = new BehaviorSubject('');

export class ToolbarMenuState {
  public onclose?: () => void;
  public openPanel: OpenPanelState;

  constructor(
    public props: ToolbarMenuProps,
    prefix: string = '',
  ) {
    this.openPanel = new OpenPanelState({selected$, prefix: prefix ? prefix + ':' : '', armed: true});
  }

  public execute = (item: MenuItem, event: React.MouseEvent): void => {
    const id = item.id ?? item.name;
    this.openPanel.onClick(id);
    if (item.onSelect) {
      item.onSelect(event);
      this.onclose?.();
    }
  };
}
