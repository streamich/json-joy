import * as React from 'react';
import {rule, drule, keyframes} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {ThemeColor} from '../../styles/color';
import {CardCtx} from './context';
import {DENSITY, toneColor} from './tokens';
import type {Density, Orientation, Surface, Tone} from './types';

export interface CardProps {
  // -------------------------------------------------------------------- Frame
  /** Surface treatment. @default 'paper' */
  surface?: Surface;
  /** Elevation step → resting shadow strength. Defaults to 1 on `paper`, 0 otherwise. */
  level?: number;
  /** Accent edge color (a CSS color / token). Defaults to the `tone` color when set. */
  accent?: string;
  /** Semantic edge + soft tint over the whole frame. @default 'default' */
  tone?: Tone;
  /** Vertical stack vs. media-leading row. @default 'vertical' */
  orientation?: Orientation;
  /** Padding / sizing scale. @default 'comfortable' @todo Make it continuous in 0..1 range. */
  density?: Density;
  width?: number | string;
  /** Selection ring + halo. */
  selected?: boolean;
  /** Loading skeleton overlay. */
  busy?: boolean;
  /** Dimmed + non-interactive. */
  disabled?: boolean;
  /** Hover-lift even without an `onClick` (does not add a pointer cursor — only a
   * real click target, `onClick` or `href`, gets `cursor: pointer`). */
  interactive?: boolean;
  onClick?: React.MouseEventHandler;
  /** When set, the root renders as an `<a>`. */
  href?: string;
  className?: string;
  style?: React.CSSProperties;

  // -------------------------------------------------------------------- Zones
  header?: React.ReactNode;
  media?: React.ReactNode;
  title?: React.ReactNode;
  body?: React.ReactNode;
  relations?: React.ReactNode;
  footer?: React.ReactNode;
  /** Free-form content that replaces the ordered zone stack (media/frame still apply). */
  children?: React.ReactNode;

  /** Selection / picker control overlaid at the top-left corner. */
  selectable?: React.ReactNode;
}

const shimmerKf = keyframes({
  '0%': {op: 0.4},
  '50%': {op: 0.75},
  '100%': {op: 0.4},
});

const rootBaseClass = rule({
  pos: 'relative',
  d: 'flex',
  bxz: 'border-box',
  minW: 0,
  ta: 'left',
  td: 'none',
  pad: 0,
  bd: 'none',
  bg: 'transparent',
  ov: 'hidden',
  trs: 'box-shadow .22s, border-color .2s',
  '@media (prefers-reduced-motion: reduce)': {trs: 'none'},
});

const rootDynClass = drule({});

const contentClass = rule({
  pos: 'relative',
  z: 1,
  d: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  minW: 0,
});

const layerClass = rule({
  pos: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

const outerClass = rule({
  pos: 'relative',
  d: 'flex',
  minW: 0,
});

const accentBarClass = rule({
  pos: 'absolute',
  insetInlineStart: '-2px',
  w: '4px',
  bdrad: '99px',
  z: 3,
  pointerEvents: 'none',
});

const selectableClass = rule({
  pos: 'absolute',
  top: '10px',
  left: '10px',
  z: 4,
});

const restShadowFor = (light: boolean, level: number): string =>
  light
    ? `0 1px 2px rgba(40,38,32,${(0.04 + 0.008 * level).toFixed(3)}), 0 ${2 + level * 2}px ${
        12 + level * 6
      }px rgba(40,38,32,${(0.05 + 0.012 * level).toFixed(3)})`
    : `0 1px 2px rgba(0,0,0,${(0.26 + 0.03 * level).toFixed(3)}), 0 ${4 + level * 2}px ${
        16 + level * 6
      }px rgba(0,0,0,${(0.32 + 0.035 * level).toFixed(3)})`;

/**
 * The card *shell* — a dumb, controlled layout skeleton.
 */
export const Card: React.FC<CardProps> = (props) => {
  const {
    surface = 'paper',
    level,
    accent,
    tone = 'default',
    orientation = 'vertical',
    density = 'comfortable',
    width,
    selected,
    busy,
    disabled,
    interactive,
    onClick,
    href,
    className,
    style,
    header,
    media,
    title,
    body,
    relations,
    footer,
    children,
    selectable,
  } = props;
  const styles = useStyles();
  const light = !!styles.light;
  const scale = DENSITY[density];
  // Top/bottom inset of the accent bar, kept clear of the rounded corners.
  const barInset = Math.max(8, Math.round(scale.radius * 0.6));

  const tc = toneColor(styles, tone);
  const tcColor = tc ? ThemeColor.from(tc) : undefined;
  const accentColor = accent ?? tc;

  // The media node carries its own `placement`; the shell reads it to decide
  // between a top banner, a leading column, or a layered background.
  const placement = React.isValidElement(media)
    ? (media as React.ReactElement<{placement?: string}>).props.placement
    : undefined;
  const isBackground = placement === 'background';
  const horizontal = orientation === 'horizontal' && !isBackground;

  // Surface = background + border.
  let background = 'transparent';
  let border = '1px solid transparent';
  const bordered = surface === 'paper' || surface === 'outline';
  if (surface === 'paper') {
    background = styles.surface.fg.pct(0, 0, 0, 0.75) + '';
    border = `1px solid ${styles.g(0, 0.1)}`;
  } else if (surface === 'outline') {
    border = `1px solid ${styles.g(0, 0.14)}`;
  }
  // A tone tints the border with its own hue (to match the soft background tint),
  // on the surfaces that actually draw a border.
  if (tc && bordered) {
    border = `1px solid ${tcColor!.softTint(0.28)}`;
  }

  // Shadows.
  const elevated = level ?? (surface === 'paper' ? 1 : 0);
  const restShadow = elevated > 0 && surface !== 'bare' && surface !== 'ghost' ? restShadowFor(light, elevated) : '';
  const liftShadow = light
    ? '0 2px 8px rgba(40,38,32,.08), 0 16px 38px rgba(40,38,32,.12)'
    : '0 2px 8px rgba(0,0,0,.4), 0 18px 42px rgba(0,0,0,.5)';

  // Selection ring.
  const ringColor = accent ?? styles.accent + '';
  const ring = selected
    ? `0 0 0 2px ${ringColor}, 0 0 0 5px ${(accent ? ThemeColor.from(accent)! : styles.accent).softTint(0.22)}`
    : '';

  const restBoxShadow = [ring, restShadow].filter(Boolean).join(', ') || 'none';
  const hoverable = !!(interactive || onClick || href) && !disabled && !busy;

  const dyn: Record<string, unknown> = {
    bg: background,
    bd: border,
    bdrad: scale.radius + 'px',
    bxsh: restBoxShadow,
    flexDirection: horizontal ? 'row' : 'column',
    w: '100%',
    // Pointer cursor only when the whole card is a real click target — an
    // `onClick` or an `<a href>`. `interactive` (hover-lift only) does not qualify.
    cur: !disabled && (onClick || href) ? 'pointer' : 'default',
    pointerEvents: disabled ? 'none' : undefined,
  };
  if (hoverable) {
    const hoverBorder =
      tc && bordered
        ? `1px solid ${tcColor!.softTint(0.42)}`
        : surface === 'ghost'
          ? `1px solid ${styles.g(0, 0.12)}`
          : surface === 'outline'
            ? `1px solid ${styles.g(0, 0.2)}`
            : border;
    dyn['&:hover'] = {
      bxsh: (selected ? `${ring}, ` : '') + liftShadow,
      bd: hoverBorder,
    };
  }

  const contentStack = (
    <div className={contentClass} style={{padding: scale.pad, gap: scale.gap}}>
      {children ?? (
        <>
          {header}
          {title}
          {body}
          {relations}
          {footer}
        </>
      )}
    </div>
  );

  const inner = (
    <>
      {tc && tone !== 'default' && surface !== 'bare' && (
        <span className={layerClass} style={{zIndex: 0, background: tcColor!.softTint(0.06)}} />
      )}
      {media}
      {contentStack}
      {busy && (
        <span
          className={layerClass}
          style={{
            zIndex: 5,
            background: `linear-gradient(110deg, ${styles.g(0, 0.05)} 30%, ${styles.g(0, 0.09)} 50%, ${styles.g(
              0,
              0.05,
            )} 70%)`,
            animation: `${shimmerKf} 1.4s ease-in-out infinite`,
          }}
        />
      )}
      {selectable !== undefined && selectable !== null && <span className={selectableClass}>{selectable}</span>}
    </>
  );

  const cls = rootBaseClass + ' ' + rootDynClass(dyn) + (className ? ' ' + className : '');
  const ctx = React.useMemo(() => ({density, orientation, surface}), [density, orientation, surface]);

  const onKeyDown =
    onClick && !href
      ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (onClick as (e: unknown) => void)(e);
          }
        }
      : undefined;

  const root = href ? (
    <a
      className={cls}
      style={style}
      href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick}
      aria-busy={busy || undefined}
    >
      {inner}
    </a>
  ) : (
    <div
      className={cls}
      style={style}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-busy={busy || undefined}
      aria-disabled={disabled || undefined}
    >
      {inner}
    </div>
  );

  const outerWidth = width !== undefined ? (typeof width === 'number' ? width + 'px' : width) : undefined;

  return (
    <CardCtx.Provider value={ctx}>
      <div className={outerClass} style={{width: outerWidth, opacity: disabled ? 0.55 : undefined}}>
        {root}
        {accentColor && surface !== 'bare' && (
          <span className={accentBarClass} style={{background: accentColor, top: barInset, bottom: barInset}} />
        )}
      </div>
    </CardCtx.Provider>
  );
};
