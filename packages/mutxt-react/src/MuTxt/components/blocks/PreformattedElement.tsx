import * as React from 'react';
import {rule, font} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {BlockPlaceholder} from './BlockPlaceholder';
import {indentPadding} from '../../behavior/indentation';
import {isEmptyBlock} from '../../util';
import type {RenderElementProps} from 'slate-react';
import type {PreformattedElement as PreformattedElementType} from '../../types';

const preClass = rule({
  pos: 'relative',
  m: '14px 0',
  pd: '12px 14px',
  bdrad: '8px',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace,' + font.mono.mid.ff,
  fz: '0.9rem',
  lh: 1.55,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  ovx: 'auto',
  tabSize: 4,
});

export interface PreformattedElementProps extends RenderElementProps {
  element: PreformattedElementType;
}

export const PreformattedElement: React.FC<PreformattedElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();

  return (
    <pre
      {...attributes}
      className={preClass}
      style={{
        textAlign: element.align,
        // marginInlineStart: indentPadding(element.indent) ?? 0,
        paddingInlineStart: 14 + (indentPadding(element.indent) ?? 0),
        marginInlineEnd: 0,
        background: styles.light ? styles.g(0, 0.04) : styles.g(1, 0.04),
        color: styles.light ? styles.g(0.16) : styles.g(0.92),
      }}
    >
      {children}
      {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
    </pre>
  );
};
