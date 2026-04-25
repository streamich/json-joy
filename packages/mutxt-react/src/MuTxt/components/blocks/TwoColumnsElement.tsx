import * as React from 'react';
import {rule} from 'nano-theme';
import {BlockPlaceholder} from './BlockPlaceholder';
import {isEmptyBlock} from '../../util';
import type {RenderElementProps} from 'slate-react';
import type {TwoColumnsElement as TwoColumnsElementType} from '../../types';

const twoColumnsClass = rule({
  pos: 'relative',
  m: '0 0 18px',
  lh: '1.8',
  columnCount: 2,
  columnGap: '36px',
  columnFill: 'balance',
  columnWidth: '18rem',
});

export interface TwoColumnsElementProps extends RenderElementProps {
  element: TwoColumnsElementType;
}

export const TwoColumnsElement: React.FC<TwoColumnsElementProps> = ({attributes, children, element}) => (
  <div
    {...attributes}
    className={twoColumnsClass}
    style={{
      textAlign: element.align,
    }}
  >
    {children}
    {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
  </div>
);