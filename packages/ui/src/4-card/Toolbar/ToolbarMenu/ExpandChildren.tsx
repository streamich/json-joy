import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarMenuMore} from './ToolbarMenuMore';
import {ToolbarMenuItem} from './ToolbarMenuItem';

export interface ExpandChildrenProps {
  item: MenuItem;
  disabled?: boolean;
}

export const ExpandChildren: React.FC<ExpandChildrenProps> = ({item, disabled}) => {
  const nodes: React.ReactNode[] = [];
  const children = item.children;
  const length = children?.length ?? 0;
  const max = item.expand ?? 5;

  for (let i = 0; i < length && i < max; i++) {
    const child = children![i];
    if (child.icon) {
      nodes.push(<ToolbarMenuItem key={child.id || child.name || i} item={child} disabled={disabled} />);
    }
  }

  if (length > max) {
    nodes.push(<ToolbarMenuMore key={'_more'} item={item} disabled={disabled} />);
  }

  return <>{nodes}</>;
};
