import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import * as css from '../../css';
import {Action, ActionProps} from '.';

const blockClass = drule({
  w: '20px',
  h: '20px',
  pos: 'absolute',
  t: '-11px',
  l: '-11px',
  z: 2,
  bdrad: '50%',
  svg: {
    fill: css.blue,
  },
});

export const CancelAction: React.FC<Omit<ActionProps, 'children' | 'className'>> = (props) => {
  const theme = useTheme();

  return (
    <Action
      {...props}
      className={blockClass({
        '&:hover': {
          bg: css.negative,
          bd: `1px solid ${css.negative}`,
          svg: {
            fill: '#fff',
          },
        },
        '&:active': {
          bg: theme.g(0.1),
          bd: `1px solid ${theme.g(0.1)}`,
        },
      })}
    >
      {'×'}
    </Action>
  );
};
