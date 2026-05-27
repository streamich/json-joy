import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import type {HslColor} from '../../styles/color/HslColor';

const eyebrowCls = rule({
  ...theme.font.display.bold,
  d: 'block',
  fz: '12px',
  lh: 1,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  mr: '0 0 14px',
});

const titleCls = rule({
  ...theme.font.display.black,
  col: 'var(--colTxtSharp)',
  fz: '36px',
  lh: '1.1em',
  mar: 0,
  pad: 0,
  '@media only screen and (max-width: 600px)': {fz: '28px'},
});

const titleLiteCls = rule({
  ...theme.font.ui3.lite,
});

const subtitleCls = rule({
  // ...theme.font.sans.mid,
  ...theme.font.display.lite,
  col: 'var(--colTxtLite)',
  fz: '15.5px',
  lh: '1.6em',
  maxW: '620px',
  mar: '12px 0 0',
  pad: 0,
  a: {
    color: 'inherit',
    td: 'underline',
    textUnderlineOffset: '3px',
    textUnderlineThickness: '1px',
    '&:hover': {td: 'underline'},
  },
});

const titleBigCls = rule({
  ...theme.font.display.black,
  fz: '64px',
  lh: '64px',
  pad: '8px 0',
  '@media only screen and (max-width: 600px)': {fz: '40px', lh: '1.1em'},
});

const subtitleBigCls = rule({
  ...theme.font.display.lite,
  fz: '18px',
  lh: '1.5em',
  col: theme.g(0.4),
  maxW: '520px',
  mar: '16px auto 0',
});

const cardCls = rule({
  [`.${eyebrowCls.trim()}`]: {
    // ...theme.font.display.bold,
    // fz: '10px',
    mr: '0 0 8px',
  },
  [`.${titleCls.trim()}`]: {
    ...theme.font.display.bold,
    fz: '25px',
  },
  // [`.${subtitleCls.trim()}`]: {
  //   fz: '13px',
  // },
});

export interface DisplayTitleProps {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
  big?: boolean;
  card?: boolean;
  small?: boolean;
  lite?: boolean;
  /** Render the title as `<h1>` instead of the default `<h2>`. Use on top-level page heroes. */
  h1?: boolean;
  /** Eyebrow color (any CSS color or {@link HslColor}). Defaults to the theme `brand2`. */
  color?: string | HslColor;
}

export const DisplayTitle: React.FC<DisplayTitleProps> = ({
  eyebrow,
  title,
  subtitle,
  lite,
  center,
  big,
  small,
  card,
  h1,
  color,
}) => {
  const styles = useStyles();

  // const linkCol = '' + styles.col.get('link', 'solid-1');

  if (!title && !subtitle && !eyebrow) return;

  const TitleTag = (h1 ? 'h1' : 'h2') as 'h1' | 'h2';

  const content = (
    <div className={card ? cardCls : void 0} style={center ? {textAlign: 'center'} : undefined}>
      {!!eyebrow && (
        <span className={eyebrowCls} style={{color: `${color ?? styles.brand2.fg}`}}>
          {eyebrow}
        </span>
      )}
      {!!title && (
        <TitleTag
          className={titleCls + (lite ? titleLiteCls : '') + (big ? titleBigCls : '')}
          style={{
            marginLeft: small ? 'auto' : undefined,
            marginRight: small ? 'auto' : undefined,
            fontSize: small ? '28px' : undefined,
          }}
        >
          {title}
        </TitleTag>
      )}
      {!!subtitle && (
        <p
          className={subtitleCls + (big ? subtitleBigCls : '')}
          style={center ? {marginLeft: 'auto', marginRight: 'auto'} : undefined}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  return content;
};
