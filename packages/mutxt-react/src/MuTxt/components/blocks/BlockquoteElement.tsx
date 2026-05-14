import * as React from 'react';
import {rule, useRule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {BlockPlaceholder} from './BlockPlaceholder';
import {indentPadding} from '../../behavior/indentation';
import {fontFamilyOf} from '../../behavior/font';
import {fgVar} from '../../custom-style/css';
import {isEmptyBlock} from '../../util';
import type {RenderElementProps} from 'slate-react';
import type {BlockquoteElement as BlockquoteElementType} from '../../types';

const blockquoteClass = rule({
  pos: 'relative',
  m: '18px 0',
  pd: '24px 18px',
  paddingInlineStart: '42px',
  fz: '1.05em',
  // lh: 1.9,
  borderStartStartRadius: 0,
  borderStartEndRadius: '16px',
  borderEndEndRadius: '16px',
  borderEndStartRadius: 0,
});

export interface BlockquoteElementProps extends RenderElementProps {
  element: BlockquoteElementType;
}

export const BlockquoteElement: React.FC<BlockquoteElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const dynamicClass = useRule(({g}) => ({
    bg: g(0, 0.015),
    borderInlineStart: `3px solid ${g(0.24)}`,
    trs: 'background 140ms ease, border-color 140ms ease',
    '&:hover': {
      bg: g(0, 0.035),
      borderInlineStartColor: g(0),
    },
  }));

  return (
    <blockquote
      {...attributes}
      className={blockquoteClass + dynamicClass}
      style={{
        textAlign: element.align,
        marginInlineStart: indentPadding(element.indent) ?? 0,
        fontFamily: fontFamilyOf(element.font),
        color: fgVar(30, styles.g(0.3)),
      }}
    >
      {children}
      {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
    </blockquote>
  );
};
