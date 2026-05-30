import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {DisplayTitle} from '../../4-card/DisplayTitle';
import {CodeCard, type CodeAnnotationSpec} from '../../5-block/CodeCard';

export interface CodeCardItem {
  /** Short title above the snippet. */
  title?: React.ReactNode;
  /** One-line description above the code. */
  intro?: React.ReactNode;
  /** Optional leading element rendered to the left of the title. */
  bullet?: React.ReactNode;
  code: string;
  lang?: string;
  fileName?: string;
  /** Hover annotations, targeted by literal substring match. */
  annotations?: CodeAnnotationSpec[];
  /** Optional caption beneath the code. */
  caption?: React.ReactNode;
}

export interface CodeCardsGridProps {
  eyebrow?: React.ReactNode;
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  items: CodeCardItem[];
  /** Optional content rendered centered below the grid, e.g. a "view all" link. */
  footer?: React.ReactNode;
}

const blockClass = rule({
  pad: '64px 16px',
});

const gridClass = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '36px 42px',
  mar: '44px 0 0',
  '@media only screen and (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
});

const titleClass = rule({
  ...theme.font.display.bold,
  col: 'var(--colTxtSharp)',
  fz: '19px',
  lh: '1.3em',
  mar: '0',
  pad: 0,
});

const introClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.4),
  fz: '14px',
  lh: '1.4em',
  mar: '0 0 14px',
  pad: 0,
});

const captionClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.5),
  fz: '13px',
  lh: '1.55em',
  mar: '12px 0 0',
  pad: 0,
});

const footerClass = rule({
  mar: '32px 0 0',
});

const headerWithBulletClass = rule({
  d: 'flex',
  ai: 'flex-start',
  gap: '12px',
  mar: '0 0 12px',
});

const bulletClass = rule({
  flex: '0 0 auto',
});

const headerTextClass = rule({
  flex: '1 1 auto',
  minW: 0,
});

/**
 * A responsive grid of short, titled code cards. Each card carries its own
 * title, one-line intro, syntax-highlighted code (with hover annotations), and
 * an optional caption. Two columns on wide screens, one on narrow.
 */
export const CodeCardsGrid: React.FC<CodeCardsGridProps> = ({eyebrow, heading, subheading, items, footer}) => (
  <section className={blockClass}>
    <DisplayTitle center eyebrow={eyebrow} title={heading} subtitle={subheading} />
    <div className={gridClass}>
      {items.map((item, i) => {
        const header =
          !!item.title || !!item.intro ? (
            <>
              {!!item.title && <h3 className={titleClass}>{item.title}</h3>}
              {!!item.intro && (
                <p className={introClass} style={item.bullet ? {margin: 0} : undefined}>
                  {item.intro}
                </p>
              )}
            </>
          ) : null;
        return (
          <div key={i}>
            {item.bullet ? (
              <div className={headerWithBulletClass}>
                <div className={bulletClass}>{item.bullet}</div>
                <div className={headerTextClass}>{header}</div>
              </div>
            ) : (
              header
            )}
            <CodeCard
              code={item.code}
              lang={item.lang ?? 'ts'}
              fileName={item.fileName}
              annotations={item.annotations}
            />
            {!!item.caption && <p className={captionClass}>{item.caption}</p>}
          </div>
        );
      })}
    </div>
    {!!footer && <div className={footerClass}>{footer}</div>}
  </section>
);

export default CodeCardsGrid;
