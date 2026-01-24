import * as React from 'react';
import {useContextMenu} from '../context';
import {Breadcrumb, Breadcrumbs} from '../../../../3-list-item/Breadcrumbs';
import type {MenuItem} from '../../../StructuralMenu/types';
import {ContextSection} from '../../ContextSection';
import {useT} from 'use-t';

export interface GroupTitleProps {
  path: MenuItem[];
  off?: number;
}

export const GroupTitle: React.FC<GroupTitleProps> = ({path, off = 0}) => {
  const [t] = useT();
  const state = useContextMenu();

  const crumbs: React.ReactNode[] = [];

  for (let i = off; i < path.length; i++) {
    const item = path[i];
    crumbs.push(
      <Breadcrumb key={item.id ?? item.name} compact onClick={() => state.select(path.slice(0, i), path[i])}>
        {t(item.name)}
      </Breadcrumb>,
    );
  }

  return (
    <ContextSection compact>
      <Breadcrumbs compact crumbs={crumbs} style={{padding: '0 0 0 2px'}} />
    </ContextSection>
  );
};
