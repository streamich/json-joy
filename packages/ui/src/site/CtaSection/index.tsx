import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {ButtonCta1} from '../../2-inline-block/Button/ButtonCta1';
import {ButtonCta2} from '../../2-inline-block/Button/ButtonCta2';
import {useStyles} from '../../styles/context';

export interface CtaSectionCta {
  label: React.ReactNode;
  /** Internal route or absolute URL. */
  to: string;
}

export interface CtaSectionProps {
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  primaryCta?: CtaSectionCta;
  secondaryCta?: CtaSectionCta;
  /** Small line shown under the CTAs. */
  supportingLine?: React.ReactNode;
}

const blockClass = rule({
  ta: 'center',
  pad: '72px 0',
});

const titleClass = rule({
  ...theme.font.display.black,
  fz: '34px',
  lh: '1.15em',
  mar: 0,
  pad: 0,
  '@media only screen and (max-width: 600px)': {fz: '26px'},
});

const subClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.42),
  fz: '17px',
  lh: '1.6em',
  maxW: '560px',
  mar: '14px auto 0',
});

const ctaRowClass = rule({
  d: 'flex',
  jc: 'center',
  ai: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  mar: '28px 0 0',
});

const supportingClass = rule({
  ...theme.font.display.lite,
  fz: '13px',
  lh: '1.4em',
  mar: '16px 0 0',
});

/**
 * Reusable closing CTA section: a headline, an optional primary/secondary
 * CTA pair, and an optional supporting line.
 */
export const CtaSection: React.FC<CtaSectionProps> = ({
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  supportingLine,
}) => {
  const styles = useStyles();

  return (
    <section className={blockClass}>
      <h2 className={titleClass} style={{color: styles.g(0.05)}}>
        {heading}
      </h2>
      {!!subheading && <p className={subClass}>{subheading}</p>}
      {(!!primaryCta || !!secondaryCta) && (
        <div className={ctaRowClass}>
          {!!primaryCta && <ButtonCta1 href={primaryCta.to}>{primaryCta.label}</ButtonCta1>}
          {!!secondaryCta && <ButtonCta2 href={secondaryCta.to}>{secondaryCta.label}</ButtonCta2>}
        </div>
      )}
      {!!supportingLine && (
        <p className={supportingClass} style={{color: styles.g(0.55)}}>
          {supportingLine}
        </p>
      )}
    </section>
  );
};

export default CtaSection;
