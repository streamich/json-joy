import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import {useT} from 'use-t';
import {MenuItem, type Props as MenuItemProps} from './MenuItem';

const nestedClass = drule({
  pd: '0 0 0 10px',
  mr: '6px 0 0 12px',
});

export interface MenuItemDef extends Omit<MenuItemProps, 'children'> {
  key: string;
  icon?: React.ReactNode;
  menuItem: React.ReactNode | ((t: (key: string) => string) => React.ReactNode);
  children?: MenuItemDef[];
  onMouseDown?: () => void;
}

export interface Props {
  items: MenuItemDef[];
  as?: string;
  style?: React.CSSProperties;
  level?: number;
}

export const Menu: React.FC<Props> = ({items, as, style, level = 1}) => {
  const Component: any = as || 'nav';
  const [t] = useT();
  const theme = useTheme();

  return (
    <Component
      style={style}
      className={
        level > 1
          ? nestedClass({
              bdl: '1px solid ' + theme.g(0.9),
            })
          : ''
      }
    >
      {items.map(({key, menuItem, icon, children, ...rest}) => {
        const name = typeof menuItem === 'function' ? menuItem(t) : menuItem;
        let item = (
          <MenuItem key={key} hasMore={!!children && !!children.length} {...rest}>
            {icon}
            {icon ? <div style={{marginLeft: 8}}>{name}</div> : name}
          </MenuItem>
        );

        if ((level < 1 || rest.activeChild) && children && children.length) {
          item = (
            <React.Fragment key={key + '_child'}>
              {item}
              <Menu items={children} level={level + 1} />
            </React.Fragment>
          );
        }

        return item;
      })}
    </Component>
  );
};
