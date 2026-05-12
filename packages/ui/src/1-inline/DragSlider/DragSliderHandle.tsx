import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockStaticClass = rule({
  d: 'inline-block',
  pos: 'relative',
  bxz: 'border-box',
  bdrad: '3px',
  us: 'none',
  va: 'middle',
  lh: 0,
  fz: 0,
  trs: 'background .12s ease-out, color .12s ease-out, transform .08s ease-out',
  transformOrigin: '50% 50%',
  transformBox: 'border-box',
});

const blockHoverActiveClass = drule({});

export interface DragSliderHandleProps {
  /** Outer width of the handle. Default `12`. */
  width?: number;
  /** Outer height of the handle. Default `18`. */
  height?: number;
  disabled?: boolean;
  variant?: 'bar' | 'dots';
  className?: string;
  style?: React.CSSProperties;
}

export const DragSliderHandle: React.FC<DragSliderHandleProps> = (props) => {
  const {width = 12, height = 18, disabled, variant = 'bar', className, style} = props;
  const styles = useStyles();

  const base = styles.g(0.55);
  const hover = styles.g(0.25);
  const pressed = styles.g(0.1);

  const pseudoCls = blockHoverActiveClass(
    disabled
      ? {}
      : {
          '&:hover': {col: hover, bg: 'rgba(128,128,128,0.12)'},
          '&:active': {col: pressed, transform: 'scale(.97)'},
        },
  );

  const blockStyle: React.CSSProperties = {
    width,
    height,
    color: base,
    background: 'transparent',
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'default' : 'inherit',
    ...style,
  };
  const blockClassName = blockStaticClass + pseudoCls + (className ? ` ${className}` : '');

  if (variant === 'bar') {
    const barW = Math.max(6, Math.round(width * 0.55));
    const barH = Math.max(8, Math.round(height * 0.7));
    return (
      <span className={blockClassName} style={blockStyle}>
        <span
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: 'auto',
            width: barW,
            height: barH,
            borderRadius: 2,
            background: 'currentColor',
          }}
        />
      </span>
    );
  }

  const dot = Math.max(2, Math.round(Math.min(width, height) * 0.22));
  const gap = Math.max(1, dot - 1);
  return (
    <span className={blockClassName} style={blockStyle}>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap,
        }}
      >
        <span style={{width: dot, height: dot, borderRadius: '50%', background: 'currentColor'}} />
        <span style={{width: dot, height: dot, borderRadius: '50%', background: 'currentColor'}} />
        <span style={{width: dot, height: dot, borderRadius: '50%', background: 'currentColor'}} />
      </span>
    </span>
  );
};
