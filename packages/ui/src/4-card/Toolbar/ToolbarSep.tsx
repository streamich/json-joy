import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {useSubtleTrace} from '../../context';

const h = React.createElement;

const separatorClass = rule({
  w: '4px',
  h: '24px',
  pd: 0,
  mr: 0,
});

export interface ToolbarSepProps {
  line?: boolean;
  thick?: boolean;
  height?: string | number | undefined;
  lite?: boolean;
  compact?: boolean;
}

export const ToolbarSep: React.FC<ToolbarSepProps> = ({line, thick, height, lite, compact}) => {
  const styles = useStyles();
  const subtle = useSubtleTrace();

  const props: any = {
    className: separatorClass,
  };

  if (line) {
    props.style = {
      width: thick ? '2px' : '1px',
      height: height ?? (subtle ? '18px' : void 0),
      margin: compact ? '0 2px' : '0 4px',
      background: styles.light ? styles.g(lite ? 0.96 : 0.92) : styles.g(lite ? 0.9 : 0.8),
    };
  }

  return h('div', props);
};
