import * as React from 'react';
import type {ContentPage} from './types';
import {Menu, type MenuItemDef} from '../../4-card/Menu';
import {Space} from '../../3-list-item/Space';
import {NiceUiSizes} from '../../constants';

export interface Props {
  steps: string[];
  page: ContentPage;
}

const pageToItem = (page: ContentPage, path: string): MenuItemDef => {
  return {
    key: page.to || page.id || page.title || '',
    menuItem: page.name,
    to: page.to,
    active: path === page.to,
    activeChild: path === page.to || path.startsWith(page.to + '/'),
    children: page.children ? page.children.map((item) => pageToItem(item, path)) : undefined,
    onMouseDown: page.md ? () => page.md!().catch(() => {}) : undefined,
  };
};

const DocsMenu: React.FC<Props> = ({steps, page}) => {
  const path = steps ? page.to + '/' + steps.slice(1).join('/') : '';

  return (
    <div style={{width: NiceUiSizes.SidebarWidth}}>
      <Space />
      <Menu items={[pageToItem(page, path)]} />
    </div>
  );
};

export default DocsMenu;
