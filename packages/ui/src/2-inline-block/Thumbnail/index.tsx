import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  pos: 'relative',
  d: 'inline-block',
  ov: 'hidden',
  flex: '0 0 auto',
  bxz: 'border-box',
  '& img, & video': {pos: 'absolute', top: 0, left: 0, w: '100%', h: '100%', objectFit: 'cover', d: 'block'},
});

const fillClass = rule({
  pos: 'absolute',
  inset: 0,
  d: 'flex',
  ai: 'center',
  jc: 'center',
});

const badgeClass = rule({
  pos: 'absolute',
  top: '6px',
  right: '6px',
  z: 1,
});

export interface ThumbnailProps {
  /** Image source. When omitted, renders a neutral placeholder (or `children`). */
  src?: string;
  alt?: string;
  /** Aspect ratio as `w/h` (e.g. `16/9`) or a CSS string. @default 1 (square) */
  aspect?: number | string;
  /** Box width; height follows from `aspect`. @default '100%' */
  width?: number | string;
  /** `rounded` softens the corners; `rect` keeps them square. @default 'rounded' */
  shape?: 'rect' | 'rounded';
  /** Overlay node pinned to the top-right (a type/format badge, duration, …). */
  badge?: React.ReactNode;
  /** Placeholder content when there's no `src` (an icon, initials). */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

/**
 * A fixed-aspect *thumbnail* box — a small media preview used in relation rows,
 * property values, and galleries. Cover-fits its `src`; falls back to a neutral
 * placeholder. `badge` overlays a corner token (format, duration, count).
 */
export const Thumbnail: React.FC<ThumbnailProps> = ({
  src,
  alt = '',
  aspect = 1,
  width = '100%',
  shape = 'rounded',
  badge,
  children,
  className,
  style,
  onClick,
}) => {
  const styles = useStyles();
  const ratio = typeof aspect === 'number' ? `${aspect}` : aspect;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: optional presentational click; consumers add semantics
    <span
      className={blockClass + (className ? ' ' + className : '')}
      onClick={onClick}
      style={{
        width,
        aspectRatio: ratio,
        borderRadius: shape === 'rounded' ? 10 : 0,
        background: styles.g(0, 0.06),
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {src ? <img src={src} alt={alt} /> : children ? <span className={fillClass}>{children}</span> : null}
      {badge !== undefined && badge !== null && <span className={badgeClass}>{badge}</span>}
    </span>
  );
};
