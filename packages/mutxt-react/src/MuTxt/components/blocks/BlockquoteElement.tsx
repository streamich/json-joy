import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {BlockPlaceholder} from './BlockPlaceholder';
import {indentPadding} from '../../behavior/indentation';
import {fontFamilyOf} from '../../behavior/font';
import {isEmptyBlock} from '../../util';
import type {RenderElementProps} from 'slate-react';
import type {BlockquoteElement as BlockquoteElementType} from '../../types';

const blockquoteClass = rule({
  pos: 'relative',
  m: '18px 0',
  pd: '14px 18px',
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

  return (
    <blockquote
      {...attributes}
      className={blockquoteClass}
      style={{
        textAlign: element.align,
        marginInlineStart: indentPadding(element.indent) ?? 0,
        fontFamily: fontFamilyOf(element.font),
        borderInlineStart: `4px solid ${styles.light ? styles.g(0.22) : styles.g(0.72)}`,
        background: styles.light ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.05)',
        color: styles.light ? styles.g(0.3) : styles.g(0.78),
      }}
    >
      {children}
      {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
    </blockquote>
  );
};
