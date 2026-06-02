import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {Iconista} from '../../icons/Iconista';
import {useStyles} from '../../styles/context';

const pillClass = drule({
  d: 'inline-flex',
  ai: 'center',
  gap: '10px',
  pd: '4px 14px 4px 4px',
  bdrad: '999px',
  td: 'none',
  fz: '13px',
  fw: 500,
  lh: 1,
  trs: 'background .15s, box-shadow .15s, border-color .15s',
  svg: {d: 'block', trs: 'transform .15s'},
  '&:hover': {td: 'none'},
  '&:hover svg': {transform: 'translateX(3px)'},
  '&:active': {tr: 'scale(.99)'},
});

const tagClass = drule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  pd: '5px 9px',
  bdrad: '999px',
  fw: 600,
  fz: '12px',
  lh: 1,
});

const labelClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '6px',
  lh: 1,
});

export interface HeroBadgeProps {
  /** Small left-side chip text. */
  tag?: React.ReactNode;
  /** Main label. */
  label?: React.ReactNode;
  /** Where the badge links to. */
  to?: string;
  /** Trailing icon (defaults to an arrow). */
  icon?: React.ReactElement;
  /** Slightly tighter padding/gap. */
  compact?: boolean;
  /** Greyscale the left tag chip instead of the link accent. */
  grey?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const HeroBadge: React.FC<HeroBadgeProps> = ({
  tag = 'Open source',
  label = (
    <>
      Star on <strong>GitHub</strong>
    </>
  ),
  to = 'https://github.com/streamich/json-joy',
  icon,
  compact,
  grey,
  className,
  style,
}) => {
  const styles = useStyles();
  const border = styles.g(0, 0.1);
  const pillCls = pillClass({
    col: styles.g(0.2),
    bg: styles.g(1, 0.6),
    bd: `1px solid ${border}`,
    bxsh: `0 1px 2px ${styles.g(0, 0.04)}`,
    ...(compact ? {gap: '7px', pd: '3px 8px 3px 3px'} : null),
    '&:hover': {
      bg: styles.g(1, 0.9),
      bd: `1px solid ${styles.g(0, 0.16)}`,
    },
  });
  const tagCls = tagClass({
    col: grey ? styles.g(0.96, 0.92) : styles.col.get('link', 'solid-1'),
    bg: grey ? styles.g(0.1, 0.9) : styles.col.get('link', 'bg-2'),
    ...(compact ? {pd: '3px 7px'} : null),
  });

  return (
    <Link a to={to} className={pillCls + (className ? ' ' + className : '')} style={style}>
      <span className={tagCls}>{tag}</span>
      <span className={labelClass} style={compact ? {transform: 'translateY(-1px)'} : undefined}>
        {label}
        {icon ??
          (compact ? (
            <span style={{display: 'flex', transform: 'translateY(1px)'}}>
              <Iconista set="lucide" icon="arrow-right" width={14} height={14} />
            </span>
          ) : (
            <Iconista set="lucide" icon="arrow-right" width={14} height={14} />
          ))}
      </span>
    </Link>
  );
};

export default HeroBadge;
