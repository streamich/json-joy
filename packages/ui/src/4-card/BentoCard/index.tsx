import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {SheetFieldWebGpu, type SheetFieldOptions} from '../../5-block/SheetFieldWebGpu';
import {StickFieldWebGpu, type StickFieldOptions} from '../../5-block/StickFieldWebGpu';
import {Border, type BorderProps} from '../Border';
import {Tilt, type TiltProps} from '../Tilt';
import {useStyles} from '../../styles/context';

export type BentoCardBackground = 'sheet' | 'stick';

const clipMarker = 'jjBentoCardClip';
const borderMarker = 'jjBentoCardBorder';
const frameMarker = 'jjBentoCardFrame';
const headerMarker = 'jjBentoCardHeader';

// Field is clipped this many px inside the card edge so the WebGPU canvas never
// paints over (or, on low-DPI screens, slightly past) the border.
const clipPad = 1.5;

const ease = 'ease-out';
const easeTime = '.22s';
const clipTrs = `clip-path ${easeTime} ${ease}, -webkit-clip-path ${easeTime} ${ease}`;
const offsetTrs = `top ${easeTime} ${ease}, right ${easeTime} ${ease}, bottom ${easeTime} ${ease}, left ${easeTime} ${ease}`;
const borderTrs = `${offsetTrs}, opacity ${easeTime} ${ease}, box-shadow ${easeTime} ${ease}`;
const frameTrs = `${offsetTrs}, opacity ${easeTime} ${ease}`;
const headerTrs = `top ${easeTime} ${ease}, margin-left ${easeTime} ${ease}, margin-right ${easeTime} ${ease}`;

const rootClass = drule({
  pos: 'relative',
});

const fieldClass = rule({
  pos: 'absolute',
  z: 0,
  pointerEvents: 'none',
  trs: clipTrs,
});

const borderClass = rule({
  pos: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  z: 2,
  op: 0,
  bdrad: 'inherit',
  pointerEvents: 'none',
  trs: borderTrs,
});

const frameClass = rule({
  pos: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  z: 2,
  bdrad: 'inherit',
  pointerEvents: 'none',
  trs: frameTrs,
});

const contentClass = rule({
  pos: 'relative',
  z: 1,
  // Fill the card when it has a definite height, so children can be positioned
  // against the card's bottom edge. Resolves to content height otherwise.
  minHeight: '100%',
  // Carry the card radius so descendants (e.g. an overflow-clip layer) can match
  // the card shape via `border-radius: inherit`.
  bdrad: 'inherit',
});

const headerClass = rule({
  pos: 'relative',
  top: 0,
  marginLeft: 0,
  marginRight: 0,
  trs: headerTrs,
});

const fieldFill: React.CSSProperties = {position: 'absolute', inset: 0};

export interface BentoCardProps {
  /**
   * Animated WebGPU field drawn behind the content. Omit for no background. See
   * {@link SheetFieldWebGpu} and {@link StickFieldWebGpu}.
   */
  background?: BentoCardBackground;
  /** Config forwarded to the chosen background field. */
  backgroundConfig?: SheetFieldOptions | StickFieldOptions;
  /**
   * Plain CSS background (e.g. a stack of gradients) for the card. Rendered on
   * the same expanding, clipped layer as the WebGPU field, so it grows with the
   * card on hover instead of being clipped at the resting edges.
   */
  backgroundStyle?: React.CSSProperties;
  /**
   * Grow the card outward on hover, in a bento grid, without shifting the
   * surrounding layout: the slot keeps its size while the chrome overflows it.
   * The content does not move or scale, and the WebGPU animation is not resized
   * (a clip opens to reveal more of it). Opt-in. Default: false.
   */
  hoverExpand?: boolean;
  /** How far each side grows when {@link hoverExpand} is on, in px. Default: 8. */
  expand?: number;
  /** Show the cursor-tracking {@link Border} effect. Opt-in. Default: false. */
  border?: boolean;
  /** Props forwarded to the {@link Border} effect. */
  borderProps?: Omit<BorderProps, 'borderRadius' | 'className' | 'style' | 'children'>;
  /** Border radius of the card. Number (px) or any CSS length. Default: 16. */
  borderRadius?: number | string;
  /**
   * Border radius while hovered; animates from {@link borderRadius} to this on
   * hover. Number (px) or any CSS length. Defaults to {@link borderRadius}.
   */
  hoverBorderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Rendered above the children. When {@link hoverExpand} is on it lifts up and
   * stretches out by {@link expand} px on hover (top and both sides) to reach the
   * grown card edges, while the children below stay put.
   */
  header?: React.ReactNode;
  /** Provide, at least empty object, to enable tilt effect. */
  tilt?: TiltProps;
  children?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  background,
  backgroundConfig,
  backgroundStyle,
  hoverExpand,
  expand = 8,
  border,
  borderProps,
  borderRadius = 16,
  hoverBorderRadius,
  className,
  style,
  header,
  tilt,
  children,
}) => {
  const styles = useStyles();
  const hasField = background === 'sheet' || background === 'stick';
  const hasSurface = hasField || !!backgroundStyle;
  const e = hoverExpand ? expand : 0;
  const radius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
  const hoverRadius =
    hoverBorderRadius == null
      ? radius
      : typeof hoverBorderRadius === 'number'
        ? `${hoverBorderRadius}px`
        : hoverBorderRadius;
  const radiusChanges = hoverRadius !== radius;
  // Clip radius is pulled in by `clipPad` to stay concentric with the inset field.
  const padRadius = (r: number | string | undefined): string =>
    typeof r === 'number' ? `${Math.max(0, r - clipPad)}px` : (r ?? radius);
  const restClip = `inset(${e + clipPad}px ${e + clipPad}px ${e + clipPad}px ${e + clipPad}px round ${padRadius(borderRadius)})`;
  const hoverClip = `inset(${clipPad}px ${clipPad}px ${clipPad}px ${clipPad}px round ${padRadius(hoverBorderRadius ?? borderRadius)})`;
  // Two border stylings: a faint 1px frame at rest, and the live Border on hover.
  const restBorder = `1px solid ${styles.g(0, 0.16)}`;
  const hoverShadow = styles.light
    ? '0 1px 2px rgba(0,0,0,.06), 0 6px 16px rgba(0,0,0,.1), 0 18px 36px rgba(0,0,0,.12)'
    : '0 1px 2px rgba(0,0,0,.5), 0 6px 16px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.07)';

  const rootCls = rootClass({
    borderRadius: radius,
    trs: `border-radius ${easeTime} ${ease}`,
    ...(hasSurface ? {[`& .${clipMarker}`]: {clipPath: restClip, WebkitClipPath: restClip}} : {}),
    ...(radiusChanges ? {'&:hover': {borderRadius: hoverRadius}} : {}),
    ...(hasSurface && (e || radiusChanges)
      ? {[`&:hover .${clipMarker}`]: {clipPath: hoverClip, WebkitClipPath: hoverClip}}
      : {}),
    ...(border
      ? {
          [`&:hover .${borderMarker}`]: {
            op: 1,
            bxsh: hoverShadow,
            ...(e ? {top: `-${e}px`, right: `-${e}px`, bottom: `-${e}px`, left: `-${e}px`} : {}),
          },
          [`&:hover .${frameMarker}`]: {
            op: 0,
            ...(e ? {top: `-${e}px`, right: `-${e}px`, bottom: `-${e}px`, left: `-${e}px`} : {}),
          },
        }
      : {}),
    ...(e && header
      ? {
          [`&:hover .${headerMarker}`]: {
            top: `-${e}px`,
            marginLeft: `-${e}px`,
            marginRight: `-${e}px`,
          },
        }
      : {}),
  });

  // Default the field to react only while the pointer is over this card (so a
  // grid of cards each answers its own hover, not the page-wide cursor). Callers
  // can override via `backgroundConfig.pointerArea`.
  let field: React.ReactNode = null;
  if (background === 'sheet')
    field = (
      <SheetFieldWebGpu
        config={{pointerArea: 'element', ...(backgroundConfig as SheetFieldOptions)}}
        style={fieldFill}
      />
    );
  else if (background === 'stick')
    field = (
      <StickFieldWebGpu
        config={{pointerArea: 'element', ...(backgroundConfig as StickFieldOptions)}}
        style={fieldFill}
      />
    );

  let content = (
    <div className={rootCls + (className ? ' ' + className : '')} style={style}>
      {!!backgroundStyle && (
        <div
          className={`${fieldClass} ${clipMarker}`}
          style={{top: -e, right: -e, bottom: -e, left: -e, ...backgroundStyle}}
        />
      )}
      {!!field && (
        <div className={`${fieldClass} ${clipMarker}`} style={{top: -e, right: -e, bottom: -e, left: -e}}>
          {field}
        </div>
      )}
      <div className={contentClass}>
        {!!header && <div className={`${headerClass} ${headerMarker}`}>{header}</div>}
        {children}
      </div>
      {!!border && (
        <>
          <div className={`${frameClass} ${frameMarker}`} style={{border: restBorder}} />
          <div className={`${borderClass} ${borderMarker}`}>
            <Border
              {...borderProps}
              reach={borderProps?.reach ?? 8}
              style={{position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit'}}
            />
          </div>
        </>
      )}
    </div>
  );

  if (tilt) content = <Tilt {...tilt}>{content}</Tilt>;

  return content;
};
