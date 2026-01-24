import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarMenuMore} from './ToolbarMenuMore';
import {ToolbarMenuItem} from './ToolbarMenuItem';

export interface ExpandSubChildrenProps {
  item: MenuItem;
  parent: MenuItem;
  disabled?: boolean;
}

export const ExpandSubChildren: React.FC<ExpandSubChildrenProps> = ({item, parent, disabled}) => {
  const nodes: React.ReactNode[] = [];
  const children = item.children;
  const length = children?.length ?? 0;
  const max = Math.min(item.expand ?? 4, 4);

  for (let i = 0; i < length; i++) {
    if (i >= max) break;
    const child = children![i];
    if (child.icon) nodes.push(<ToolbarMenuItem key={child.id || child.name || i} item={child} disabled={disabled} />);
  }

  nodes.push(<ToolbarMenuMore key={'_more'} item={parent} disabled={disabled} />);

  return <>{nodes}</>;
};
