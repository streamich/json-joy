import * as React from 'react';
import {rule, theme} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import {PageWidth} from '../../6-page/PageWidth';
import {ButtonCta1} from '../../2-inline-block/Button/ButtonCta1';
import {ButtonCta2} from '../../2-inline-block/Button/ButtonCta2';
import {DisplayTitle} from '../../4-card/DisplayTitle';
import {useStyles} from '../../styles/context';
import {HeroDoodles} from '../HeroDoodles';

/** Px spacing that can differ between desktop and the <600px breakpoint. */
export type HeroSpacing = number | {desktop?: number; mobile?: number};

export interface HeroCta {
  label: React.ReactNode;
  /** Internal route or absolute URL. Omit when using `onClick`. */
  to?: string;
  /** Click handler, used when `to` is absent. */
  onClick?: React.MouseEventHandler;
  /** Visual style. Defaults: first CTA is `invert`, the rest are `outline`. */
  variant?: 'invert' | 'outline';
  /** Fill color for the primary (CTA1) button; ignored by secondary buttons. */
  color?: string;
}

export interface HeroProps {
  /** Small uppercase kicker shown above the title. */
  eyebrow?: React.ReactNode;
  /**
   * Accent color (any CSS color) for the eyebrow and the primary CTA fill.
   * Falls back to the theme `brand2` for the eyebrow and the default invert
   * style for the CTA. A per-CTA {@link HeroCta.color} overrides it.
   */
  accentColor?: string;
  /** Main headline. */
  title?: React.ReactNode;
  /** Supporting paragraph under the title. */
  subtitle?: React.ReactNode;
  /** Badge/pill shown above the eyebrow, e.g. `<HeroBadge .../>`. */
  badge?: React.ReactNode;
  /** Proof strip shown under the subtitle, e.g. `<ProofStrip .../>`. */
  proof?: React.ReactNode;
  /** CTA buttons rendered in a centered row. */
  ctas?: HeroCta[];
  /** Custom CTA slot override. */
  cta?: React.ReactNode;
  /** Small supporting line under the CTAs. */
  supporting?: React.ReactNode;
  /** Render the floating decorative doodle layer behind the content. */
  doodles?: boolean;
  /** Top spacing. Defaults to 64px desktop / 24px mobile. */
  top?: HeroSpacing;
  /** Bottom spacing. Defaults to 166px desktop / 64px mobile. */
  bottom?: HeroSpacing;
  /** Max content width in px. */
  maxWidth?: number;
}

const heroClass = rule({
  ta: 'center',
  pad: '0 8px',
  mar: '0 auto',
  // Keep the headline above the decorative doodle layer.
  pos: 'relative',
  zIndex: 1,
  '@media only screen and (max-width: 1000px)': {pad: '0 32px'},
  '@media only screen and (max-width: 600px)': {pad: '0 16px'},
});

const ctaRowClass = rule({
  d: 'flex',
  jc: 'center',
  ai: 'center',
  flexWrap: 'wrap',
  gap: '12px',
});

const supportingClass = rule({
  ...theme.font.display.lite,
  fz: '13px',
  lh: '1.4em',
  mar: '16px 0 0',
});

const DEFAULT_TOP = {desktop: 64, mobile: 24};
const DEFAULT_BOTTOM = {desktop: 166, mobile: 64};

const resolveSpacing = (
  spacing: HeroSpacing | undefined,
  mobile: boolean,
  fallback: {desktop: number; mobile: number},
): number => {
  if (typeof spacing === 'number') return spacing;
  return mobile ? (spacing?.mobile ?? fallback.mobile) : (spacing?.desktop ?? fallback.desktop);
};

/**
 * Reusable page-top hero.
 */
export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  accentColor,
  title,
  subtitle,
  badge,
  proof,
  ctas,
  cta,
  supporting,
  doodles,
  top,
  bottom,
  maxWidth = 800,
}) => {
  const styles = useStyles();
  const {width} = useWindowSize();
  const mobile = width < 600;
  const topPx = resolveSpacing(top, mobile, DEFAULT_TOP);
  const bottomPx = resolveSpacing(bottom, mobile, DEFAULT_BOTTOM);

  return (
    <div>
      {!!doodles && <HeroDoodles />}
      <PageWidth>
        <div style={{height: topPx}} />
        <header className={heroClass} style={{maxWidth}}>
          {!!badge && <div style={{display: 'flex', justifyContent: 'center', paddingBottom: 24}}>{badge}</div>}
          <DisplayTitle h1 big center eyebrow={eyebrow} color={accentColor} title={title} subtitle={subtitle} />
          {proof}
          {cta
            ? cta
            : !!ctas?.length && (
                <div className={ctaRowClass} style={{marginTop: proof ? 0 : 32}}>
                  {ctas.map((cta, i) => {
                    const primary = (cta.variant ?? (i === 0 ? 'invert' : 'outline')) === 'invert';
                    const ButtonCta = primary ? ButtonCta1 : ButtonCta2;
                    return (
                      <ButtonCta
                        key={i}
                        color={primary ? (cta.color ?? accentColor) : undefined}
                        href={cta.to}
                        onClick={cta.to ? undefined : cta.onClick}
                      >
                        {cta.label}
                      </ButtonCta>
                    );
                  })}
                </div>
              )}
          {!!supporting && (
            <p className={supportingClass} style={{color: styles.g(0.55)}}>
              {supporting}
            </p>
          )}
        </header>
        <div style={{height: bottomPx}} />
      </PageWidth>
    </div>
  );
};

export default Hero;
