import {rule, theme} from 'nano-theme';
import * as React from 'react';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import DocsMd from '../DocsMd';

const blockClass = rule({
  pos: 'relative',
  fz: '0.95em',
  mar: '20px 0 0 0',
  bxz: 'border-box',
  maxW: '780px',
  bd: `1px solid ${theme.g(0.92)}`,
  bdl: '3px solid #07f',
  bdrad: '4px',
  pad: '24px 48px 24px 32px',
  bg: theme.g(0.99),
  '&:hover': {
    bd: `1px solid ${theme.g(0.8)}`,
    bdl: '3px solid ' + theme.g(0.4),
  },
  svg: {
    fill: theme.g(0.4),
    col: theme.g(0.4),
  },
  '@media (max-width: 800px)': {
    pad: '16px',
  },
});

export interface Props {
  node: ICode;
}

const Note: React.FC<Props> = ({node}) => {
  return (
    <div className={'ff-note' + blockClass}>
      <DocsMd md={node.value} />
    </div>
  );
};

export default Note;
