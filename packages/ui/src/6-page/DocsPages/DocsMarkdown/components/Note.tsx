import {drule} from 'nano-theme';
import * as React from 'react';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import {useStyles} from '../../../../styles/context';
import DocsMd from '../DocsMd';

const blockClass = drule({
  pos: 'relative',
  fz: '0.95em',
  mar: '20px 0 0 0',
  bxz: 'border-box',
  maxW: '780px',
  bdl: '3px solid #07f',
  bdrad: '4px',
  pad: '24px 48px 24px 32px',
  '@media (max-width: 800px)': {
    pad: '16px',
  },
});

export interface Props {
  node: ICode;
}

const Note: React.FC<Props> = ({node}) => {
  const styles = useStyles();
  const cls = blockClass({
    bd: `1px solid ${styles.g(0.92)}`,
    bg: styles.g(0.99),
    '&:hover': {
      bd: `1px solid ${styles.g(0.8)}`,
      bdl: '3px solid ' + styles.g(0.4),
    },
    svg: {
      fill: styles.g(0.4),
      col: styles.g(0.4),
    },
  });
  return (
    <div className={'ff-note' + cls}>
      <DocsMd md={node.value} />
    </div>
  );
};

export default Note;
