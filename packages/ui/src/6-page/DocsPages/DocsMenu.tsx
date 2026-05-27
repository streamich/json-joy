import * as React from 'react';
import type {ContentPage} from './types';
import {Menu, type MenuItemDef} from '../../4-card/Menu';
import {Space} from '../../3-list-item/Space';
import {NiceUiSizes} from '../../constants';

export interface Props {
  steps: string[];
  page: ContentPage;
}

const pageToItem = (page: ContentPage, path: string, index: number): MenuItemDef => {
  if (page.sep) {
    return {
      key: 'sep-' + (page.id ?? page.name ?? index),
      sep: true,
    };
  }
  return {
    key: page.to || page.id || page.title || page.name || String(index),
    menuItem: page.display ? page.display() : page.name,
    to: page.to,
    active: path === page.to,
    activeChild: path === page.to || (!!page.to && path.startsWith(page.to + '/')),
    children: page.children ? page.children.map((item, i) => pageToItem(item, path, i)) : undefined,
    onMouseDown: page.md ? () => page.md!().catch(() => {}) : undefined,
  };
};

const DocsMenu: React.FC<Props> = ({steps, page}) => {
  const path = steps ? page.to + '/' + steps.slice(1).join('/') : '';

  return (
    <div style={{width: NiceUiSizes.SidebarWidth}}>
      <Space />
      <Menu items={[pageToItem(page, path, 0)]} />
    </div>
  );
};

export default DocsMenu;
