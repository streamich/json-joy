import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const h = React.createElement;

const separatorClass = rule({
  h: '1px',
  mar: '3px 0',
  w: '100%',
});

export interface ContextSepProps {
  line?: boolean;
  grey?: boolean;
  small?: boolean;
  noMargin?: boolean;
}

export const ContextSep: React.FC<ContextSepProps> = ({line, grey, small, noMargin}) => {
  const styles = useStyles();
  const light = styles.light;

  const props: any = {
    className: separatorClass,
    role: 'separator',
  };

  if (line) {
    props.style = {
      background: light ? styles.g(0.92) : styles.g(0.8),
    };
  }

  if (grey) {
    props.style = {
      height: small ? 3 : 7,
      margin: 0,
      background: light ? styles.g(0.985) : styles.g(0.92),
    };
  }

  if (noMargin) {
    props.style.margin = 0;
  }

  return h('div', props);
};
