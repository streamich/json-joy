import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const h = React.createElement;

const separatorClass = rule({
  w: '4px',
  h: '24px',
  pd: 0,
  mr: 0,
});

export interface ToolbarSepProps {
  line?: boolean;
}

export const ToolbarSep: React.FC<ToolbarSepProps> = ({line}) => {
  const styles = useStyles();

  const props: any = {
    className: separatorClass,
  };

  if (line) {
    props.style = {
      width: '1px',
      margin: '0 4px',
      background: styles.light ? styles.g(0.92) : styles.g(0.8),
    };
  }

  return h('div', props);
};
