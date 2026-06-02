import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {DisplayTitle} from '../../4-card/DisplayTitle';
import {Button} from '../../2-inline-block/Button';

export interface ShowcaseSectionCta {
  label: React.ReactNode;
  /** Internal route or absolute URL. */
  to: string;
}

export interface ShowcaseSectionProps {
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  /** Body content; pass one or more `<p>` elements. */
  children: React.ReactNode;
  cta?: ShowcaseSectionCta;
}

const blockClass = rule({
  pad: '64px 0',
});

const proseClass = rule({
  maxW: '720px',
  pad: '24px 0 0',
  '& p': {
    ...theme.font.display.lite,
    col: theme.g(0.32),
    fz: '17px',
    lh: '1.7em',
    mar: '0 0 16px',
    pad: 0,
  },
  '& p:last-child': {mar: 0},
});

const ctaClass = rule({
  pad: '24px 0 0',
});

/**
 * Reusable showcase / proof section: a heading, prose body, and a single CTA.
 */
export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({heading, subheading, children, cta}) => {
  return (
    <section className={blockClass}>
      <DisplayTitle title={heading} subtitle={subheading} />
      <div className={proseClass}>{children}</div>
      {!!cta && (
        <div className={ctaClass}>
          <Button primary size={1} radius={1} href={cta.to}>
            {cta.label}
          </Button>
        </div>
      )}
    </section>
  );
};

export default ShowcaseSection;
