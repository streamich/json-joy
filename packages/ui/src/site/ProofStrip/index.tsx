import * as React from 'react';
import {rule, drule, theme} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {useStyles} from '../../styles/context';
import {fonts} from '../../styles/font';
import {DisplayTitle} from '../../4-card/DisplayTitle';

export interface ProofStripItem {
  label: React.ReactNode;
  /** Optional link to the supporting evidence for this item. */
  to?: string;
  /** Small index shown above the label, e.g. "01" or "1.". */
  num?: React.ReactNode;
  /** Small icon shown to the left of the label. */
  icon?: React.ReactNode;
}

export interface ProofStripProps {
  items: ProofStripItem[];
  /** Auto-number items as "01", "02"… when an item has no explicit `num`. */
  numbered?: boolean;
  /** Render the number inline to the left of the label instead of above it. */
  numLeft?: boolean;
  /** Optional section heading; when set the strip renders as a full section. */
  heading?: React.ReactNode;
  /** Optional section subheading. */
  subheading?: React.ReactNode;
  /** Optional caption line shown beneath the strip. */
  caption?: React.ReactNode;
}

const blockClass = rule({
  pad: '64px 0',
  ta: 'center',
});

const stripClass = rule({
  d: 'flex',
  jc: 'center',
  ai: 'flex-start',
  flexWrap: 'wrap',
  gap: '24px 44px',
  pad: '28px 16px',
});

const itemClass = drule({
  d: 'inline-flex',
  flexDirection: 'column',
  ai: 'flex-start',
  gap: '4px',
  td: 'none',
  trs: 'color .15s',
  '&:hover': {td: 'none'},
  '&:hover [data-pf=label]': {textDecorationLine: 'underline'},
  '&:active [data-pf=label]': {textDecorationLine: 'underline'},
});

const numClass = rule({
  // ...theme.font.display.bold,
  // ...theme.font.mono.bold,
  ...fonts.get('mono', 'bold', 0),
  fz: '11px',
  lh: 1,
  letterSpacing: '.04em',
});

const rowClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '4px',
});

const iconClass = rule({
  d: 'inline-flex',
  ai: 'center',
  flex: '0 0 auto',
});

const labelClass = rule({
  ...theme.font.display.mid,
  col: 'inherit',
  fz: '14px',
  lh: '1.2em',
  td: 'none',
  bdrad: '6px',
  pd: '4px',
  textUnderlineOffset: '4px',
  // textDecorationColor: '#07f',
  '&:hover': {
    bg: '#07f',
    col: '#fff',
    textDecorationColor: '#ffffff55',
  },
  trs: 'color .15s',
});

const captionClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.5),
  fz: '14px',
  lh: '1.6em',
  mar: '20px 0 0',
  pad: 0,
});

/**
 * Single horizontal strip of short proof items. Each item can carry a small
 * index number (above) and an icon (left).
 */
export const ProofStrip: React.FC<ProofStripProps> = ({items, numbered, numLeft, heading, subheading, caption}) => {
  const styles = useStyles();
  const rest = '' + styles.g(0.42);
  const numCol = '' + styles.g(0.72);
  const iconCol = '' + styles.g(0.5);
  const itemCls = itemClass({col: rest, '&:hover': {col: '#000'}, '&:active': {col: '#000'}});

  const strip = (
    <div className={stripClass}>
      {items.map((item, i) => {
        const num = item.num ?? (numbered ? String(i + 1).padStart(2, '0') : undefined);
        const inner = (
          <>
            {!numLeft && num !== undefined && (
              <span className={numClass} style={{color: numCol}}>
                {num}
              </span>
            )}
            <span className={rowClass}>
              {numLeft && num !== undefined && (
                <span className={numClass} style={{color: numCol}}>
                  {num}
                </span>
              )}
              {!!item.icon && (
                <span className={iconClass} style={{color: iconCol}}>
                  {item.icon}
                </span>
              )}
              <span className={labelClass} data-pf="label">
                {item.label}
              </span>
            </span>
          </>
        );

        return item.to ? (
          <Link key={i} a to={item.to} className={itemCls}>
            {inner}
          </Link>
        ) : (
          <span key={i} className={itemCls}>
            {inner}
          </span>
        );
      })}
    </div>
  );

  if (!heading && !subheading && !caption) return strip;

  return (
    <section className={blockClass}>
      <DisplayTitle title={heading} subtitle={subheading} center />
      {strip}
      {!!caption && <p className={captionClass}>{caption}</p>}
    </section>
  );
};

export default ProofStrip;
