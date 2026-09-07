import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {ThemeColor} from '../../styles/color';
import {Eyebrow} from '../Eyebrow';

const wrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  minW: 0,
  verticalAlign: 'middle',
});

const tileClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  bxz: 'border-box',
  ov: 'hidden',
  // '& svg': {d: 'block', w: '60%', h: '60%'},
  '& img': {w: '100%', h: '100%', objectFit: 'cover'},
});

const plainClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  '& svg': {d: 'block'},
});

export interface TypeBadgeProps {
  /** The type glyph (e.g. a Lucide icon node) or an image. */
  icon: React.ReactNode;
  /** Optional type/kind label rendered as an eyebrow beside the tile. */
  label?: React.ReactNode;
  /** `square` = a rounded tile behind the icon; `plain` = the bare icon. @default 'square' */
  variant?: 'square' | 'plain';
  /** Tile / icon box size in px. @default 36 */
  size?: number;
  /** Tone color: colors the icon and (square variant) derives a soft-tint tile
   * background from it. Defaults to a mid neutral icon on a faint neutral tile. */
  color?: string;
  /** Override the (square) tile background; defaults to a soft tint of `color`
   * (or a faint neutral when no `color` is set). */
  background?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The *type badge* — a thing's icon shown as a small rounded tile (or bare
 * glyph), optionally followed by its type label. The identity mark at the start
 * of a card header, and a standalone token elsewhere.
 */
export const TypeBadge: React.FC<TypeBadgeProps> = ({
  icon,
  label,
  variant = 'square',
  size = 36,
  color,
  background,
  className,
  style,
}) => {
  const styles = useStyles();
  const square = variant === 'square';
  const tone = color ? ThemeColor.from(color) : undefined;
  const iconColor = color ?? styles.g(0.35);
  const boxStyle: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.56),
    color: iconColor,
    fill: iconColor,
  };
  if (square) {
    boxStyle.borderRadius = Math.max(7, Math.round(size * 0.28));
    boxStyle.background = background ?? (tone ? tone.softTint(0.16) : styles.g(0, 0.06));
  }

  return (
    <span className={wrapClass + (className ? ' ' + className : '')} style={style}>
      <span className={square ? tileClass : plainClass} style={boxStyle}>
        {icon}
      </span>
      {label !== undefined && label !== null && <Eyebrow>{label}</Eyebrow>}
    </span>
  );
};
