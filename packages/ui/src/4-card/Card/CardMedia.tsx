import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {useCardCtx} from './context';

const baseClass = rule({
  pos: 'relative',
  d: 'block',
  ov: 'hidden',
  '& > picture, & > img, & > video, & > canvas': {
    pos: 'absolute',
    inset: 0,
    w: '100%',
    h: '100%',
    objectFit: 'cover',
    d: 'block',
  },
});

const topClass = rule({
  w: '100%',
});

const leadingClass = rule({
  flex: '0 0 auto',
  alignSelf: 'stretch',
});

const backgroundClass = rule({
  pos: 'absolute',
  inset: 0,
  z: 0,
});

const overlayClass = rule({
  pos: 'absolute',
  inset: 0,
  z: 1,
  d: 'flex',
  pointerEvents: 'none',
  '& > *': {pointerEvents: 'auto'},
});

const scrimClass = rule({
  pos: 'absolute',
  inset: 0,
  z: 1,
  pointerEvents: 'none',
});

export interface CardMediaProps {
  placement?: 'top' | 'leading' | 'background';
  /** Aspect ratio (`16/9`) — applied to `top`. */
  aspect?: number | string;
  /** Fixed width of the `leading` column. @default 96 */
  width?: number | string;
  /** Cover/media node: `<img>`, `<Thumbnail>`, video, canvas. */
  children: React.ReactNode;
  /** Caption / badges drawn over the media. */
  overlay?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardMedia: React.FC<CardMediaProps> = ({
  placement = 'top',
  aspect,
  width = 96,
  children,
  overlay,
  className,
  style,
}) => {
  const styles = useStyles();
  const {density} = useCardCtx();

  if (placement === 'leading') {
    return (
      <div
        className={baseClass + leadingClass + (className ? ' ' + className : '')}
        style={{width, background: styles.g(0, 0.06), ...style}}
      >
        {children}
        {overlay !== undefined && overlay !== null && <span className={overlayClass}>{overlay}</span>}
      </div>
    );
  }

  if (placement === 'background') {
    return (
      <div className={baseClass + ' ' + backgroundClass + (className ? ' ' + className : '')} style={style}>
        {children}
        <span
          className={scrimClass}
          style={{
            background: styles.light
              ? `linear-gradient(to top, rgba(255,255,255,.92) 0%, rgba(255,255,255,.55) 45%, rgba(255,255,255,0) 100%)`
              : 'linear-gradient(to top, rgba(0,0,0,.86) 0%, rgba(0,0,0,.5) 45%, rgba(0,0,0,0) 100%)',
          }}
        />
        {overlay !== undefined && overlay !== null && <span className={overlayClass}>{overlay}</span>}
      </div>
    );
  }

  // top
  const ratio =
    aspect === undefined ? (density === 'dense' ? '21/9' : '16/9') : typeof aspect === 'number' ? `${aspect}` : aspect;
  return (
    <div
      className={baseClass + topClass + (className ? ' ' + className : '')}
      style={{aspectRatio: ratio, background: styles.g(0, 0.02), ...style}}
    >
      {children}
      {overlay !== undefined && overlay !== null && <span className={overlayClass}>{overlay}</span>}
    </div>
  );
};
