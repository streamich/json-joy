import * as React from 'react';
import {lightTheme as theme, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import type {ColorSpecifier} from '../../styles/color/types';

const blockClass = rule({
  ...theme.font.mono.bold,
  d: 'inline-block',
  pad: '.1em .2em',
  bdrad: '.25em',
  col: theme.color.sem.blue[0],
  fz: '.9em',
});

const blockAltClass = rule({
  ...theme.font.mono.mid,
});

export interface CodeProps {
  col?: ColorSpecifier;
  gray?: boolean;
  noBg?: boolean;
  size?: number;
  alt?: boolean;
  border?: boolean;
  nowrap?: boolean;
  spacious?: boolean;
  roundest?: boolean;
  children?: React.ReactNode;
  onMouseDown?: React.MouseEventHandler;
}

export const Code: React.FC<CodeProps> = ({
  col = ['neutral'],
  gray,
  noBg,
  size,
  alt,
  border,
  nowrap,
  spacious,
  roundest,
  children,
  onMouseDown,
}) => {
  const styles = useStyles();
  const style: React.CSSProperties = {
    // background: theme.g(0, 0.04),
    color: styles.col.col(col) + '',
    // background: styles.col.g('bg-2'),
    background: styles.g(0.1, 0.04),
  };

  if (size) {
    style.fontSize = `${0.9 + size / 10}em`;
  }

  if (gray) {
    style.color = styles.g(0, 0.7);
    style.background = styles.g(0, 0.04);
  }

  if (noBg) {
    style.background = 'transparent';
  }

  if (border) {
    style.border = `1px solid ${styles.g(0, 0.06)}`;
  }

  if (nowrap) {
    style.whiteSpace = 'nowrap';
  }

  if (spacious) {
    style.padding = '.175em .6em .125em';
  }

  if (roundest) {
    style.borderRadius = '1em';
  }

  return (
    <code className={blockClass + (alt ? blockAltClass : '')} style={style} onMouseDown={onMouseDown}>
      {children}
    </code>
  );
};
