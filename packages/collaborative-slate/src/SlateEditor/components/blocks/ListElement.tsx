import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {RenderElementProps} from 'slate-react';
import type {BulletedListElement, ListItemElement as ListItemNode, NumberedListElement} from '../../types';

const listClass = rule({
  m: '0 0 16px',
  pl: '24px',
});

const itemClass = rule({
  m: '0 0 8px',
  lh: '1.7',
});

export interface ListContainerElementProps extends RenderElementProps {
  element: BulletedListElement | NumberedListElement;
}

export interface ListItemElementProps extends RenderElementProps {
  element: ListItemNode;
}

export const ListContainerElement: React.FC<ListContainerElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  if (element.type === 'ol') {
    return (
      <ol
        {...attributes}
        className={listClass}
        style={{color: styles.light ? styles.g(0.18) : styles.g(0.88), paddingLeft: '26px'}}
      >
        {children}
      </ol>
    );
  }

  return (
    <ul {...attributes} className={listClass} style={{color: styles.light ? styles.g(0.18) : styles.g(0.88)}}>
      {children}
    </ul>
  );
};

export const ListItemElement: React.FC<ListItemElementProps> = ({attributes, children, element}) => (
  <li {...attributes} className={itemClass} style={{textAlign: element.align}}>
    {children}
  </li>
);