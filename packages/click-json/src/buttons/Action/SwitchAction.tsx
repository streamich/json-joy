import * as React from 'react';
import {drule} from 'nano-theme';
import * as css from '../../css';
import {Action, ActionProps} from '.';

const blockClass = drule({
  w: '20px',
  h: '20px',
  bdrad: '50%',
  svg: {
    fill: css.blue,
  },
});

export const SwitchAction: React.FC<Omit<ActionProps, 'children' | 'className'>> = (props) => {
  return (
    <Action {...props} className={blockClass()}>
      {'~'}
    </Action>
  );
};
