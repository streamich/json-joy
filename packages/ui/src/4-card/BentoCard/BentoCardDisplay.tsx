import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {HslColor} from '../../styles/color/HslColor';
import {hedgehog} from '../../5-block/StickFieldWebGpu/presets/hedgehog';
import {defaultSheet} from '../../5-block/SheetFieldWebGpu/presets/default';
import type {SheetFieldOptions} from '../../5-block/SheetFieldWebGpu/types';
import {BasicButtonExpand} from '../../2-inline-block/BasicButton/BasicButtonExpand';
import ButtonCta1 from '../../2-inline-block/Button/ButtonCta1';
import {Iconista} from '../../icons/Iconista';
import {BentoCard, type BentoCardProps} from '.';
import {defaultConfig} from '../../5-block/StickFieldWebGpu/presets/default';
import type {StickFieldOptions} from '../../5-block/StickFieldWebGpu';
import {useStyles} from '../../styles/context';

const blockCls = rule({
  '&:active': {
    transform: 'scale(.99)',
  },
});

const headerRowCls = rule({
  d: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
  pad: '24px',
});

const rightRowCls = rule({
  d: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const cardTintClass = drule({});
const expandBtnMarker = 'jjBentoCardExpandBtn';
const ctaMarker = 'jjBentoCardCta';

// CTA pinned 48px above the card's bottom, centered. Hidden and nudged down at
// rest; floats up and fades in on card hover.
const ctaCls = rule({
  pos: 'absolute',
  left: 0,
  right: 0,
  bottom: '48px',
  d: 'flex',
  jc: 'center',
  op: 0,
  pointerEvents: 'none',
  transform: 'translateY(94px)',
  trs: 'opacity .3s ease, transform .3s cubic-bezier(.2,1,.4,1)',
});

const ctaGlowStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 0 30px 10px #fff, 0 0 20px 5px #fff, 0 0 10px 2px #fff',
};

// Clips the floating CTA to the card shape so it does not overflow the edges.
const ctaClipCls = rule({
  pos: 'absolute',
  inset: 0,
  ov: 'hidden',
  bdrad: 'inherit',
  pointerEvents: 'none',
});

export interface BentoCardDisplayProps extends BentoCardProps {
  /** Main color, as a CSS string or {@link HslColor}. Drives the field and border palettes. */
  color?: string | HslColor;
  /** Header content on the left. */
  left?: React.ReactNode;
  /** Header content on the right (e.g. an expand button). */
  right?: React.ReactNode;
  animation?: '' | 'rays' | 'dots' | 'blob';
  /**
   * Fires when the card is clicked, unless the click landed on an interactive
   * element (button, link, input) inside the card. Takes precedence over
   * {@link onExpand} for card clicks.
   */
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * Expand the card (e.g. open it in a modal). When set, the whole card becomes
   * clickable (calls this unless a button inside is clicked) and an expand
   * button is rendered at the top-right, after any custom {@link right} content.
   */
  onExpand?: () => void;
  /**
   * Call-to-action shown 48px above the card's bottom, centered. Hidden at rest;
   * floats up and fades in on hover. The button uses the card {@link color}.
   */
  cta?: {label: React.ReactNode; to: string};
}

const toHsl = (color: string | HslColor): HslColor =>
  color instanceof HslColor ? color : (HslColor.from(color) ?? HslColor.from('#07f')!);

export const BentoCardDisplay: React.FC<BentoCardDisplayProps> = (props) => {
  const {
    color = '#07f',
    animation,
    left,
    right,
    onCardClick,
    onExpand,
    cta,
    header,
    backgroundConfig,
    borderProps,
    style,
    className = '',
    children,
    ...rest
  } = props;
  const clickable = !!(onCardClick || onExpand);
  const [hovered, setHovered] = React.useState(false);
  const styles = useStyles();

  const base = toHsl(color);
  const fieldColors = hovered
    ? // ? [base.complement().pct(0, 0, 0.1).toString(), base.complement().pct(0, -0.15, -0.1).toString(), base.toString()]
      styles.brand.map((c) => c.toString())
    : [base.toString(), base.pct(0, 0, 0.22).toString(), base.pct(0, -0.15, 0.1).toString()];
  // Border palette swept around the wheel from the base: analogous, triadic
  // accent, and complement, with lightness nudges so the ring shimmers.
  const borderColors = [
    base.toString(),
    base
      .analogous(1 / 12)
      .pct(0, 0.1, 0.16)
      .toString(),
    base.accentColor().pct(0, 0, 0.08).toString(),
    base.complement().pct(0, 0, 0.14).toString(),
  ];
  let animationType: BentoCardProps['background'] = void 0;
  let animationConfig: BentoCardProps['backgroundConfig'] = void 0;
  if (animation === 'rays') {
    animationType = 'stick';
    const restYaw = (backgroundConfig as StickFieldOptions | undefined)?.yawSpeed ?? hedgehog.yawSpeed ?? 0.1;
    animationConfig = {
      ...hedgehog,
      colors: fieldColors,
      radius: 1.4,
      origin: [0.5, 1.1],
      ...(backgroundConfig as StickFieldOptions | undefined),
      yawSpeed: hovered ? 0.3 : restYaw,
    };
    if (hovered) {
      animationConfig.colors = styles.brand.map((c) => c.toString());
      animationConfig.colorActive = 4;
    }
  } else if (animation === 'dots') {
    animationType = 'sheet';
    const dotsConfig: SheetFieldOptions = {
      ...defaultSheet,
      colors: fieldColors,
      origin: [0.5, 0.63],
      style: 'dots',
      dotCount: 222,
      lineCount: 222,
      // dotWidth: 0.6,
    };
    if (hovered) {
      Object.assign(dotsConfig, {
        pulse: 0.25,
        foldSpeed: 1,
        twistSpeed: 1,
        pitchSpeed: 0.7,
        followStrength: 0.2,
      });
    } else {
      Object.assign(dotsConfig, {
        foldSpeed: 0.2,
        // twistSpeed: 0.2,
        // pulseSpeed: 0.3,
      });
    }
    animationConfig = dotsConfig;
  } else if (animation === 'blob') {
    animationType = 'stick';
    animationConfig = {
      ...defaultConfig,
      radius: 1.6,
      origin: [0.5, 1.1],
      colors: fieldColors,
      followStrength: 0.3,
    };
    if (!hovered) {
      Object.assign(animationConfig, {
        pulse: 0.02,
        pulseSpeed: 0.2,
        yawSpeed: 0.1,
        pitchSpeed: 0.1,
        distance: {
          ...defaultConfig.distance,
          waveSpeed: 1.5,
        },
      });
    } else {
      animationConfig.colorActive = 4;
    }
  }

  const buttonTint = base.pct(0, 0, 0, -0.9).toString();
  const cardColor = base.toString();
  const expandTint = base.pct(0, 0, 0, -0.86).toString();
  const cardCls = cardTintClass({
    '&:hover [data-testid="BasicButton"]': {bg: buttonTint},
    // Auto expand button: slight card tint + solid card-color icon at rest;
    // solid card-color bg + white icon on card hover; and inverted (white bg,
    // card-color border + icon) when the button itself is hovered. Only the
    // colors change - the icon keeps its default expand-on-hover animation.
    ...(onExpand
      ? {
          [`& .${expandBtnMarker}`]: {
            bg: `${expandTint} !important`,
            transform: 'scale(1)',
            trs: 'background .15s ease, transform .15s ease, box-shadow .15s ease',
          },
          [`& .${expandBtnMarker} .chevron`]: {
            stroke: cardColor,
            trs: 'transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275), stroke .2s ease',
          },
          // Grow the button by 4px (32 -> 36) on card hover, via scale to avoid layout shift.
          [`&:hover .${expandBtnMarker}`]: {bg: `${cardColor} !important`, transform: 'scale(1.125)'},
          [`&:hover .${expandBtnMarker} .chevron`]: {stroke: '#fff'},
          [`&:hover .${expandBtnMarker}:hover`]: {bg: '#fff !important', bxsh: `inset 0 0 0 1.5px ${cardColor}`},
          [`&:hover .${expandBtnMarker}:hover .chevron`]: {stroke: cardColor},
        }
      : {}),
    // Float the CTA up into view on card hover.
    ...(cta ? {[`&:hover .${ctaMarker}`]: {op: 1, transform: 'translateY(0)', pointerEvents: 'auto'}} : {}),
  });

  const expandButton = onExpand ? (
    <BasicButtonExpand className={expandBtnMarker} rounder size={32} tooltip onClick={onExpand} />
  ) : null;
  const headerNode =
    header ??
    (left || right || expandButton ? (
      <div className={headerRowCls}>
        <div>{left}</div>
        {(right || expandButton) && (
          <div className={rightRowCls}>
            {right}
            {expandButton}
          </div>
        )}
      </div>
    ) : undefined);

  const card = (
    <BentoCard
      background={animationType}
      backgroundConfig={animationConfig}
      hoverExpand
      border
      borderRadius={16}
      hoverBorderRadius={6}
      tilt={{scale: 1, max: 5}}
      {...rest}
      className={cardCls + (className ? ' ' + className : '')}
      borderProps={{radius: 333, delay: 222, thickness: 2, colors: borderColors, ...borderProps}}
      header={headerNode}
      style={clickable ? {cursor: 'pointer', ...style} : style}
    >
      {children}
      {!!cta && (
        <div className={ctaClipCls}>
          <div className={`${ctaCls} ${ctaMarker}`}>
            <div style={ctaGlowStyle}>
              <ButtonCta1
                color={cardColor}
                spacious
                href={cta.to}
                iconRight
                icon={<Iconista set="lucide" icon="arrow-right" width={15} height={15} />}
              >
                {cta.label}
              </ButtonCta1>
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  );

  const handleClick = clickable
    ? (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, [role="button"], [data-testid="BasicButton"]')) return;
        if (onCardClick) onCardClick(event);
        else onExpand?.();
      }
    : undefined;

  // `display: contents` keeps the card as the layout box; mouseover/mouseout
  // bubble through it (mouseenter/leave would not), so they drive `hovered`.
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: pointer convenience; interactive children stay keyboard-accessible
    // biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover (rotation speed only); no focus equivalent needed
    <div
      className={blockCls}
      style={{display: 'contents'}}
      onMouseOver={() => setHovered(true)}
      onMouseOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
      onClick={handleClick}
    >
      {card}
    </div>
  );
};
