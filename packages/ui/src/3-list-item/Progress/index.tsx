import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const h = React.createElement;

const blockClass = drule({
  h: '2px',
  pos: 'relative',
  trs: 'width 0.3s',
  transitionTimingFunction: 'cubic-bezier(.08,.91,.26,1)',
});

const glowClass = drule({
  pos: 'absolute',
  right: 0,
  w: '100px',
  h: '2px',
  transform: 'rotate(3deg) translate(0px, -4px)',
});

export interface ProgressProps {
  value?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}

export const Progress: React.FC<ProgressProps> = ({value = 0, glow, style}) => {
  const styles = useStyles();
  const glowColor = styles.col.get('success', 'solid-1');
  return h(
    'div',
    {
      className: blockClass({bg: styles.col.get('success', 'el-3')}),
      style: {
        ...style,
        width: Math.min(1, Math.max(0, value)) * 100 + '%',
      },
    },
    !!glow &&
      h('div', {
        className: glowClass({
          boxShadow: `0 0 10px ${glowColor}, 0 0 5px ${glowColor}, 0 0 5px ${glowColor}`,
        }),
      }),
  );
};
