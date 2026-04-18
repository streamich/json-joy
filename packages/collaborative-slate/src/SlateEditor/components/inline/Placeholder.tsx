import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {RenderPlaceholderProps} from 'slate-react';

const placeholderClass = rule({
  pe: 'none',
  us: 'none',
  fz: '16px',
});

export interface PlaceholderProps extends RenderPlaceholderProps {}

export const Placeholder: React.FC<PlaceholderProps> = ({attributes, children}) => {
  const styles = useStyles();
  return (
    <span
      {...attributes}
      className={placeholderClass}
      style={{
        ...attributes.style,
        color: styles.light ? styles.g(0.48) : styles.g(0.56),
        opacity: 1,
      }}
    >
      {children}
    </span>
  );
};