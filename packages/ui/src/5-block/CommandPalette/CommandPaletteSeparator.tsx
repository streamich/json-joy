import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const height = 64;

const blockClass = drule({
  w: '100%',
  h: `${height}px`,
  bxz: 'border-box',
  pad: '0 16px',
});

export interface CommandPaletteInputProps {
  value: React.ReactNode;
}

export const CommandPaletteInput: React.FC<CommandPaletteInputProps> = ({value}) => {
  const styles = useStyles();
  return <div className={blockClass({bd: `1px solid ${styles.g(0, 0.1)}`})}>{value}</div>;
};
