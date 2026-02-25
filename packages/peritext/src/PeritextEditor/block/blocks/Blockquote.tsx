import * as React from 'react';
import {rule} from 'nano-theme';
import type {BlockViewProps} from '../../../PeritextWebUi/react/BlockView';

const blockClass = rule({
  bg: 'rgba(0,0,0,.02)',
  bdl: '8px solid rgba(0,0,0,.1)',
  mr: 0,
  pd: '.05em .5em .05em 1.5em',
  bdrad: '4px',
});

export interface BlockquoteProps extends BlockViewProps {
  children: React.ReactNode;
}

export const Blockquote: React.FC<BlockquoteProps> = ({block, children}) => {
  return <blockquote className={blockClass}>{children}</blockquote>;
};
