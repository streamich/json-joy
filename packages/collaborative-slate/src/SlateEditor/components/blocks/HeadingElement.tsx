import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {RenderElementProps} from 'slate-react';
import type {HeadingElement as HeadingElementType} from '../../types';

const headingClass = rule({
  pos: 'relative',
  ls: '-0.03em',
});

export interface HeadingElementProps extends RenderElementProps {
  element: HeadingElementType;
}

export const HeadingElement: React.FC<HeadingElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const shared: React.CSSProperties = {
    textAlign: element.align,
    color: styles.light ? styles.g(0.08) : styles.g(0.96),
  };

  switch (element.type) {
    case 'h1':
      return (
        <h1
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '2.1rem',
            fontWeight: 800,
            margin: '0 0 18px',
            lineHeight: 1.1,
          }}
        >
          {children}
        </h1>
      );
    case 'h2':
      return (
        <h2
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1.55rem',
            fontWeight: 700,
            margin: '10px 0 14px',
            lineHeight: 1.2,
          }}
        >
          {children}
        </h2>
      );
    default:
      return (
        <h3
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1.22rem',
            fontWeight: 700,
            margin: '8px 0 12px',
            lineHeight: 1.3,
            color: styles.light ? styles.g(0.16) : styles.g(0.88),
          }}
        >
          {children}
        </h3>
      );
  }
};