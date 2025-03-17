// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import type {BlockViewProps} from '../../react/BlockView';

const blockClass = rule({
  bg: 'rgba(0,0,0,.02)',
  bdl: '8px solid rgba(0,0,0,.1)',
  mr: '0',
  pd: '.8em .5em .8em 2em',
  bdrad: '4px',
});

export interface BlockquoteProps extends BlockViewProps {
  children: React.ReactNode;
}

export const Blockquote: React.FC<BlockquoteProps> = ({block, children}) => {
  return <blockquote className={blockClass}>{children}</blockquote>;
};
