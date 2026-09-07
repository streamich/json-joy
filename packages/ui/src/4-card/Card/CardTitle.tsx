import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';
import {useCardCtx} from './context';

const display = fonts.get('display', 'mid');
const displayMid = fonts.get('display', 'mid');

const blockClass = drule({
  d: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minW: 0,
});

const titleClass = drule({
  ...display,
  fw: 600,
  d: 'block',
  minW: 0,
  mar: 0,
  letterSpacing: '-.01em',
  textWrap: 'balance',
  wordBreak: 'break-word',
});

const linkClass = drule({
  col: 'inherit',
  textDecoration: 'none',
  '&:hover': {textDecoration: 'underline', textUnderlineOffset: '2px'},
});

const subtitleClass = drule({
  ...displayMid,
  d: 'block',
  minW: 0,
  fz: '13px',
  lh: '17px',
  fw: 400,
  textWrap: 'pretty',
  wordBreak: 'break-word',
});

const SIZES = {
  sm: {fz: 14, lh: 18},
  md: {fz: 16, lh: 21},
  lg: {fz: 18, lh: 24},
} as const;

export interface CardTitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Clamp the title to N lines. */
  clamp?: 1 | 2 | 3;
  /** Render the title as a link. */
  href?: string;
  /** Explicit size; otherwise derived from the card's density. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  title,
  subtitle,
  clamp,
  href,
  size,
  className,
  style,
  onClick,
}) => {
  const styles = useStyles();
  const {density} = useCardCtx();
  const resolved = size ?? (density === 'comfortable' ? 'md' : density === 'compact' ? 'sm' : 'sm');
  const {fz, lh} = SIZES[resolved];
  const clampStyle: React.CSSProperties = clamp
    ? {display: '-webkit-box', WebkitLineClamp: clamp, WebkitBoxOrient: 'vertical', overflow: 'hidden'}
    : {};
  const titleNode = (
    // biome-ignore lint/a11y/useKeyWithClickEvents: an optional title click is a secondary affordance; the Card root provides the keyboard-accessible activation (or use `href`)
    <span
      className={titleClass({col: styles.g(0.06), fz: fz + 'px', lh: lh + 'px'})}
      style={{...clampStyle, cursor: onClick && !href ? 'pointer' : undefined}}
      onClick={!href ? onClick : undefined}
    >
      {title}
    </span>
  );
  return (
    <span className={blockClass({}) + (className ? ' ' + className : '')} style={style}>
      {href ? (
        <a className={linkClass({})} href={href} onClick={onClick}>
          {titleNode}
        </a>
      ) : (
        titleNode
      )}
      {subtitle !== undefined && subtitle !== null && (
        <span className={subtitleClass({col: styles.g(0.42)})}>{subtitle}</span>
      )}
    </span>
  );
};
