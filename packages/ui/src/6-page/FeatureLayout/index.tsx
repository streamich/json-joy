import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Iconista} from '../../icons/Iconista';
import {ButtonCta1} from '../../2-inline-block/Button/ButtonCta1';
import {ButtonCta2} from '../../2-inline-block/Button/ButtonCta2';
import {NumberBadge} from '../../2-inline-block/NumberBadge';
import {GradientSurface, type GradientBlob} from '../../4-card/GradientSurface';
import {Stat} from '../../4-card/Stat';
import {CheckList} from '../../5-block/CheckList';
import {Separator} from '../../3-list-item/Separator';
import {HslColor} from '../../styles/color/HslColor';
import type {ContentFeature} from './types';

const bp = '@media only screen and (max-width: 800px)';

const sectionCls = rule({
  pad: '64px 0',
  [bp]: {pad: '40px 0'},
});

const heroCls = rule({
  d: 'grid',
  gridTemplateColumns: '1.4fr 1fr',
  gap: '48px',
  alignItems: 'start',
  [bp]: {gridTemplateColumns: '1fr', gap: '28px'},
});

const eyebrowCls = rule({
  ...theme.font.display.bold,
  d: 'block',
  fz: '12px',
  lh: 1,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  mar: '0 0 16px',
});

const heroTitleCls = rule({
  ...theme.font.display.black,
  col: 'var(--colTxtSharp)',
  fz: '52px',
  lh: '1.08em',
  mar: 0,
  [bp]: {fz: '36px'},
});

const heroSubtitleCls = rule({
  ...theme.font.display.lite,
  fz: '19px',
  lh: '1.55em',
  mar: '20px 0 0',
  maxW: '520px',
});

const ctaRowCls = rule({
  d: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  mar: '32px 0 0',
});

const showcaseCls = rule({
  d: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gridAutoRows: '1fr',
  gap: '24px',
  [bp]: {gridTemplateColumns: '1fr'},
});

// Blob positions for the stats cards, distinct from the main illustration's.
const statBlobs: GradientBlob[] = [
  {size: '85% 75%', at: '0% 0%'},
  {size: '90% 80%', at: '100% 100%', color: 'secondary'},
];

const statColCls = rule({
  d: 'grid',
  gridAutoRows: 'min-content',
  alignContent: 'start',
  gap: '24px',
});

const valuePropsCls = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '40px',
  [bp]: {gridTemplateColumns: '1fr', gap: '28px'},
});

const iconBadgeCls = rule({
  d: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '44px',
  h: '44px',
  bdrad: '12px',
  mar: '0 0 18px',
});

const vpTitleCls = rule({
  ...theme.font.ui2.bold,
  fz: '18px',
  mar: '0 0 8px',
});

const bodyCls = rule({
  ...theme.font.ui2.lite,
  fz: '17px',
  lh: '1.6em',
  mar: 0,
});

const ctaSectionCls = rule({
  pad: '64px 0',
  textAlign: 'center',
  [bp]: {pad: '40px 0'},
});

const ctaHeadingCls = rule({
  ...theme.font.display.black,
  col: 'var(--colTxtSharp)',
  fz: '40px',
  lh: '1.12em',
  mar: 0,
  [bp]: {fz: '30px'},
});

const ctaActionsCls = rule({
  d: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '12px',
  mar: '28px 0 0',
});

export interface FeatureLayoutProps {
  feature: ContentFeature;
  /** Heading above the related cross-links. Default: "More to discover". */
  moreLabel?: string;
  color?: HslColor;
}

/**
 * Marketing layout for a single product {@link ContentFeature}: a split hero
 * (headline and CTAs beside a highlights checklist), a showcase row pairing the
 * feature visual with stat callouts, a row of icon value props, and a grid of
 * "more to discover" cross-links. Each section renders only when its data is
 * present.
 */
export const FeatureLayout: React.FC<FeatureLayoutProps> = ({feature, moreLabel = 'More to discover', color}) => {
  const styles = useStyles();
  // Primary color: the one specified on the feature, else derived by hashing
  // its id or name. Secondary and shades are computed from it.
  const primary = React.useMemo(
    () => color ?? HslColor.from(feature.color ?? '') ?? HslColor.fromHash(feature.id || feature.name || 'feature'),
    [color, feature.color, feature.id, feature.name],
  );
  const accent = primary.toString();
  const accentInk = primary.pct(0, 0, -0.25).toString();
  // Lighter tint for the value-prop bullet backgrounds.
  const bulletBg = primary.pct(0, 0, 0, -0.95).toString();
  const metricGradient = `linear-gradient(60deg, ${primary}, ${primary.gradientPair()})`;
  const muted = styles.g(0.4);
  const {
    eyebrow,
    title,
    name,
    subtitle,
    about,
    highlights,
    primaryCta,
    secondaryCta,
    visual,
    visualSmall,
    stats,
    valueProps,
  } = feature;
  // When no value prop has an icon, fall back to numbered bullets.
  const numberedValueProps = !!valueProps?.length && valueProps.every((vp) => !vp.icon);
  const numberStyle: React.CSSProperties = {
    color: accentInk,
    borderColor: primary.pct(0, 0, 0, -0.78).toString(),
    background: bulletBg,
  };
  // Bottom CTA target: the feature's own page, by slug.
  const ctaTo = feature.to ?? (feature.slug ? `/${feature.slug}` : undefined);

  return (
    <>
      <section className={sectionCls}>
        <div className={heroCls}>
          <div>
            {!!eyebrow && (
              <span className={eyebrowCls} style={{color: accentInk}}>
                {eyebrow}
              </span>
            )}
            <h1 className={heroTitleCls}>{title ?? name}</h1>
            {!!(subtitle ?? about) && (
              <p className={heroSubtitleCls} style={{color: muted}}>
                {subtitle ?? about}
              </p>
            )}
            {!!(primaryCta || secondaryCta) && (
              <div className={ctaRowCls}>
                {!!primaryCta && (
                  <ButtonCta1 href={primaryCta.to} color={accent}>
                    {primaryCta.label}
                  </ButtonCta1>
                )}
                {!!secondaryCta && <ButtonCta2 href={secondaryCta.to}>{secondaryCta.label}</ButtonCta2>}
              </div>
            )}
          </div>
          {!!highlights?.length && <CheckList items={highlights} color={accent} style={{marginTop: 42}} />}
        </div>
      </section>

      {!!(visual || stats?.length) && (
        <section className={sectionCls} style={{paddingTop: 0, marginTop: 0}}>
          <div className={showcaseCls}>
            {!!visual && (
              <GradientSurface
                color={styles.grey.fg + ''}
                minHeight={320}
                hoverRadius={8}
                glowRadius={333}
                glowDelay={111}
              >
                {visual()}
              </GradientSurface>
            )}
            {!!(stats?.length || visualSmall) && (
              <div className={statColCls}>
                {stats?.map((stat, i) => (
                  <GradientSurface key={i} color={styles.grey.fg + ''} blobs={statBlobs} hoverRadius={8}>
                    <Stat
                      value={stat.value}
                      unit={stat.unit}
                      label={stat.label}
                      gradient={metricGradient}
                      unitColor={accentInk}
                      labelColor={muted}
                    />
                  </GradientSurface>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!!valueProps?.length && (
        <section className={sectionCls}>
          <div className={valuePropsCls}>
            {valueProps.map((vp, i) => (
              <div key={i}>
                {numberedValueProps ? (
                  <div style={{margin: '0 0 18px'}}>
                    <NumberBadge style={numberStyle}>{i + 1}</NumberBadge>
                  </div>
                ) : (
                  !!vp.icon && (
                    <span className={iconBadgeCls} style={{background: bulletBg}}>
                      <Iconista {...vp.icon} width={22} height={22} color={accent} />
                    </span>
                  )
                )}
                {!!vp.title && <div className={vpTitleCls}>{vp.title}</div>}
                <p className={bodyCls} style={{color: muted}}>
                  {vp.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* {!!related?.length && (
        <section className={sectionCls}>
          <SectionTitle title={moreLabel} />
          <div className={relatedGridCls}>
            {related.map((link, i) => (
              <div key={i}>
                <div
                  className={thumbCls}
                  style={{background: link.visual ? softGradient : cardGradient(i), border: cardBorder}}
                >
                  {link.visual?.()}
                </div>
                {!!link.body && (
                  <p className={bodyCls} style={{color: muted}}>
                    {link.body}
                  </p>
                )}
                <Link a to={link.to} className={relatedLinkCls} style={{color: accentInk}}>
                  <span className={relatedLabelCls} style={{textDecorationColor: underlineColor}}>
                    {link.title}
                  </span>
                  <Iconista set="ibm_16" icon="arrow--right" width={16} height={16} color={accentInk} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )} */}

      {!!ctaTo && (
        <>
          <Separator />
          <section className={ctaSectionCls}>
            <h2 className={ctaHeadingCls}>Get started with {name ?? title}</h2>
            <div className={ctaActionsCls}>
              <ButtonCta1 href={ctaTo} color={accent}>
                Get started
              </ButtonCta1>
            </div>
          </section>
        </>
      )}
    </>
  );
};
