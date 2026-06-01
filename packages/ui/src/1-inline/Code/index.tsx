import * as React from 'react';
import {lightTheme as theme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...theme.font.mono.bold,
  d: 'inline-block',
  pd: '.1em .2em',
  bdrad: '.25em',
  lh: '1.2em',
  col: theme.color.sem.blue[0],
  fz: '.9em',
});

const outlineClass = drule({
  pd: '.14rem .42rem',
  bdrad: '.42em',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  fz: '.92em',
  fw: 500,
  ls: '-0.01em',
});

const blockAltClass = rule({
  ...theme.font.mono.mid,
});

const blockSansClass = rule({
  ...theme.font.sans.mid,
});

export interface CodeProps {
  gray?: boolean;
  noBg?: boolean;
  size?: number;
  alt?: boolean;
  border?: boolean;
  nowrap?: boolean;
  spacious?: boolean;
  big?: boolean;
  sans?: boolean;
  /** Tight padding and slightly smaller text for inline use within prose. */
  compact?: boolean;
  roundest?: boolean;
  outline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onMouseDown?: React.MouseEventHandler;
}

export const Code: React.FC<CodeProps> = ({
  gray,
  noBg,
  size,
  alt,
  border,
  nowrap,
  spacious,
  big,
  sans,
  compact,
  roundest,
  outline,
  className,
  style: styleProp,
  children,
  onMouseDown,
}) => {
  const styles = useStyles();

  const style: React.CSSProperties = {
    color: styles.neutral.g(0.9, 0.86),
  };

  if (size) {
    style.fontSize = `${0.9 + size / 10}em`;
  }

  if (gray) {
    style.color = styles.g(0, 0.7);
    style.background = styles.g(0, 0.04);
  }

  if (border) {
    style.border = `1px solid ${styles.g(0, 0.06)}`;
  }

  if (nowrap) {
    style.whiteSpace = 'nowrap';
  }

  if (compact) {
    style.padding = '.06em .3em';
    style.fontSize = '.88em';
  }

  if (big) {
    style.padding = '.5em .8em .5em';
  } else if (spacious) {
    style.padding = '.175em .6em .125em';
  }

  if (roundest) {
    style.borderRadius = '1em';
  }

  if (styleProp) Object.assign(style, styleProp);

  if (outline) {
    style.background = styles.bg.col(0, 1) + '';
  }

  if (noBg) {
    style.background = 'transparent';
  }

  return (
    <code
      className={
        blockClass({
          bg: styles.neutral.g(0.8, 0.08),
          '&:hover': {
            bg: styles.neutral.g(0.3, 0.1),
          },
        }) +
        (outline
          ? outlineClass({
              bd: `1px solid ${styles.g(0, 0.05)}`,
              bxsh: `inset 0 1px 0 ${styles.g(1, 0.16)}, 0 1px 2px ${styles.g(0, 0.06)}`,
              col: styles.g(0.08),
              '&:hover': {
                bd: `1px solid ${styles.g(0, 0.2)}`,
                bxsh: `inset 0 1px 0 ${styles.g(1, 0.08)}, 0 1px 2px ${styles.g(0, 0.03)}`,
                col: styles.g(0.02),
              },
            })
          : '') +
        (alt ? blockAltClass : '') +
        (sans ? blockSansClass : '') +
        (className ? ' ' + className : '')
      }
      style={style}
      onMouseDown={onMouseDown}
    >
      {children}
    </code>
  );
};
