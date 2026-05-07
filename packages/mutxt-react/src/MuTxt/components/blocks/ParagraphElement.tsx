import * as React from 'react';
import {rule} from 'nano-theme';
import {BlockPlaceholder} from './BlockPlaceholder';
import {indentPadding} from '../../behavior/indentation';
import {fontFamilyOf} from '../../behavior/font';
import {isEmptyBlock} from '../../util';
import type {RenderElementProps} from 'slate-react';
import type {ParagraphElement as ParagraphElementType} from '../../types';

const paragraphClass = rule({
  pos: 'relative',
  m: '0 0 14px',
  lh: '1.8',
});

export interface ParagraphElementProps extends RenderElementProps {
  element: ParagraphElementType;
}

export const ParagraphElement: React.FC<ParagraphElementProps> = ({attributes, children, element}) => (
  <p
    {...attributes}
    className={paragraphClass}
    style={{
      textAlign: element.align,
      paddingInlineStart: indentPadding(element.indent),
      fontFamily: fontFamilyOf(element.font),
    }}
  >
    {children}
    {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
  </p>
);
