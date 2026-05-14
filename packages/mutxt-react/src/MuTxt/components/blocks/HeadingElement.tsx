import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {BlockPlaceholder} from './BlockPlaceholder';
import {indentPadding} from '../../behavior/indentation';
import {fontFamilyOf} from '../../behavior/font';
import {fgVar} from '../../custom-style/css';
import {isEmptyBlock} from '../../util';
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
    paddingInlineStart: indentPadding(element.indent),
    fontFamily: fontFamilyOf(element.font),
    color: fgVar(8, styles.g(0.08)),
  };

  switch (element.type) {
    case 'title':
      return (
        <h1
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '3.8rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: '48px 0 8px',
            lineHeight: 1.05,
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </h1>
      );
    case 'subtitle':
      return (
        <p
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1.55rem',
            fontWeight: 300,
            margin: '0 0 28px',
            lineHeight: 1.55,
            color: fgVar(40, styles.g(0.4)),
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </p>
      );
    case 'h1':
      return (
        <h1
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '2.1rem',
            fontWeight: 800,
            margin: '40px 0 18px',
            lineHeight: 1.1,
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
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
            margin: '34px 0 14px',
            lineHeight: 1.2,
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </h2>
      );
    case 'h3':
      return (
        <h3
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1.22rem',
            fontWeight: 700,
            margin: '26px 0 12px',
            lineHeight: 1.3,
            color: fgVar(16, styles.g(0.16)),
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </h3>
      );
    case 'h4':
      return (
        <h4
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: '22px 0 10px',
            lineHeight: 1.4,
            color: fgVar(24, styles.g(0.24)),
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </h4>
      );
    case 'h5':
      return (
        <h5
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1.1rem',
            fontWeight: 700,
            margin: '18px 0 8px',
            lineHeight: 1.5,
            color: fgVar(32, styles.g(0.32)),
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </h5>
      );
    case 'h6':
      return (
        <h6
          {...attributes}
          className={headingClass}
          style={{
            ...shared,
            fontSize: '1rem',
            fontWeight: 700,
            margin: '14px 0 6px',
            lineHeight: 1.6,
            color: fgVar(40, styles.g(0.4)),
          }}
        >
          {children}
          {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
        </h6>
      );
    default:
      return <div {...attributes}>{children}</div>;
  }
};
