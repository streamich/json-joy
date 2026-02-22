import * as React from 'react';
import {useIconsGrid} from '../context';
import Paper from '../../../../../../4-card/Paper';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'flex',
  jc: 'center',
  ai: 'center',
  w: '64px',
  h: '64px',
});

const imgClass = rule({
  w: '16px',
  h: '16px',
});

export interface IconCardProps {
  set: string;
  icon: string;
}

export const IconCard: React.FC<IconCardProps> = ({set, icon}) => {
  const state = useIconsGrid();

  return (
    <Paper
      as={'button'}
      className={blockClass}
      hover
      hoverElevate
      fill={1}
      noOutline
      onClick={() => state.select(set, icon)}
    >
      <img className={imgClass} src={state.href(set, icon)} alt={icon} />
    </Paper>
  );
};
