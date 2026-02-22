import * as React from 'react';
import type {IListItem} from 'very-small-parser/lib/markdown';
import {rule, makeRule} from 'nano-theme';
import type {RenderNode} from '../types';
import {FixedColumn} from '../../3-list-item/FixedColumn';

const itemClass = rule({
  'ol &': {
    fz: '0.9em',
    padl: '8px',
  },
  listStyle: 'none',
  pos: 'relative',
  '&::before': {
    bdrad: '50%',
    content: '""',
    d: 'block',
    h: '6px',
    w: '6px',
    left: '-1.25em',
    top: '0.75em',
    pos: 'absolute',
  },
});

const useItemClass = makeRule((theme) => ({
  '&::before': {
    bg: theme.g(0.8),
  },
}));

const itemInnerClass = rule({
  'ol li &': {
    fz: '1.1111111111111112em',
  },
});

const taskItemClass = rule({
  // listStyleType: 'none',
  mar: '0 0 0 -22px',
  pad: 0,
});

export interface ItemProps {
  children?: React.ReactNode;
}

const Item: React.FC<ItemProps> = ({children}) => {
  const dynamicItemClass = useItemClass();

  return (
    <li className={itemClass + dynamicItemClass}>
      <div className={itemInnerClass}>{children}</div>
    </li>
  );
};

const renderListItem: RenderNode = (renderers, flat, idx, props, state) => {
  const node = flat.nodes[idx] as IListItem;
  const parent = flat.nodes[(node as any).parent];
  const {checked} = node;
  const content = renderers.children(renderers, flat, idx, props, state);

  if (typeof checked !== 'boolean') {
    if ((parent as any).ordered) {
      return <li>{content}</li>;
    } else {
      return <Item>{content}</Item>;
    }
  }

  return (
    <li className={taskItemClass}>
      <FixedColumn left={22}>
        <div>
          <input type="checkbox" checked={checked} onChange={() => undefined} />
        </div>
        <div>{content}</div>
      </FixedColumn>
    </li>
  );
};

export default renderListItem;
