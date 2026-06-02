import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {fonts} from '../../styles/font';
import {DisplayTitle} from '../../4-card/DisplayTitle';

export interface FourCardRowCard {
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Small index shown above the title, e.g. "01". */
  num?: React.ReactNode;
  /** Small icon shown to the left of the title. */
  icon?: React.ReactNode;
}

export interface FourCardRowProps {
  /** Optional section heading. */
  heading?: React.ReactNode;
  /** Optional section subheading, shown under the heading. */
  subheading?: React.ReactNode;
  /** Cards to render, designed for 1-4 per row. */
  cards: FourCardRowCard[];
  /** Optional caption line shown beneath the row. */
  caption?: React.ReactNode;
  /** Auto-number cards as "01", "02"... when an item has no explicit `num`. */
  numbered?: boolean;
  /** Remove padding around the block, for tighter layouts. */
  noPadding?: boolean;
}

const blockClass = rule({
  pad: '64px 0',
  '@media only screen and (max-width: 600px)': {pad: '40px 0'},
});

const rowClass = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(var(--cols), minmax(0, 1fr))',
  gap: '24px',
  pad: '40px 0 0',
  '@media only screen and (max-width: 1000px)': {
    gridTemplateColumns: 'repeat(var(--cols-md), minmax(0, 1fr))',
    gap: '40px 24px',
  },
  '@media only screen and (max-width: 600px)': {gridTemplateColumns: '1fr', gap: '32px', pad: '28px 0 0'},
});

const cardClass = rule({
  pad: '0 8px',
  '@media only screen and (max-width: 600px)': {pad: 0},
});

const numClass = rule({
  ...fonts.get('mono', 'bold', 0),
  d: 'block',
  fz: '11px',
  lh: 1,
  letterSpacing: '.04em',
  mar: '0 0 10px',
});

const titleClass = rule({
  ...theme.font.display.bold,
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  fz: '20px',
  lh: '1.2em',
  mar: 0,
  pad: 0,
});

const iconClass = rule({
  d: 'inline-flex',
  ai: 'center',
  flex: '0 0 auto',
});

const bodyClass = rule({
  ...theme.font.display.lite,
  fz: '15px',
  lh: '1.6em',
  mar: '14px 0 0',
  pad: 0,
});

const captionClass = rule({
  ...theme.font.display.lite,
  fz: '14px',
  lh: '1.6em',
  mar: '32px 0 0',
  pad: 0,
});

export const FourCardRow: React.FC<FourCardRowProps> = ({heading, subheading, cards, caption, numbered, noPadding}) => {
  const styles = useStyles();
  const numCol = '' + styles.g(0.72);
  const iconCol = '' + styles.g(0.5);
  const count = cards.length;
  const rowStyle = {['--cols' as any]: count, ['--cols-md' as any]: Math.min(count, 2)} as React.CSSProperties;

  if (noPadding) {
    rowStyle.padding = 0;
  }

  return (
    <section className={blockClass} style={noPadding ? {padding: 0} : undefined}>
      <DisplayTitle lite title={heading} subtitle={subheading} />
      <div className={rowClass} style={rowStyle}>
        {cards.map((card, i) => {
          const num = card.num ?? (numbered ? String(i + 1).padStart(2, '0') : undefined);
          return (
            <article key={i} className={cardClass}>
              {num !== undefined && (
                <span className={numClass} style={{color: numCol}}>
                  {num}
                </span>
              )}
              <h3 className={titleClass}>
                {!!card.icon && (
                  <span className={iconClass} style={{color: iconCol}}>
                    {card.icon}
                  </span>
                )}
                {card.title}
              </h3>
              {!!card.body && <p className={bodyClass}>{card.body}</p>}
            </article>
          );
        })}
      </div>
      {!!caption && <p className={captionClass}>{caption}</p>}
    </section>
  );
};

export default FourCardRow;
