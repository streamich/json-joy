import * as React from 'react';
import {rule} from 'nano-theme';
import {useDragSliderState} from '../DragSlider/context';

const DEFAULT_BG = '#d4d4d4';
const DEFAULT_SHADOW =
  '0 0 2px rgba(0,0,0,0.4), inset 0 0 1px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.6), 0 4px 2px rgba(0,0,0,0.2), 0 9px 4px rgba(0,0,0,0.1), inset 0 2px 1px rgba(255,255,255,1.0)';

/**
 * Outer container reserves a fixed 16x16 layout footprint so the inner thumb
 * can morph.
 */
const containerClass = rule({
  pos: 'relative',
  d: 'inline-block',
  w: '16px',
  h: '16px',
  va: 'middle',
  bxz: 'border-box',
});

const thumbClass = rule({
  pos: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  w: '16px',
  h: '16px',
  bdrad: '20px',
  bd: 0,
  pad: 0,
  out: 'none',
  trs: 'background-color .1s, box-shadow .1s, width .1s, height .1s, outline .1s',
  '&:hover': {
    out: '6px solid rgba(127,127,127,.12)',
  },
  '&:before': {
    content: '""',
    pos: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    w: '14px',
    h: '14px',
    bdrad: '50%',
    bg: 'radial-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.1) 55%, rgba(255,255,255,0.0) 75%)',
    pe: 'none',
  },
  '&:after': {
    content: '""',
    pos: 'absolute',
    top: '-5px',
    left: '2px',
    w: '15px',
    h: '15px',
    bdrad: '12px',
    bg: 'radial-gradient(rgba(255,255,255,1.0), rgba(255,255,255,0.05), rgba(255,255,255,0.0))',
    pe: 'none',
    trs: 'top .1s, left .1s',
  },
});

const thumbDraggingClass = rule({
  w: '8px',
  h: '24px',
  out: '6px solid rgba(127,127,127,.12)',
  '&:after': {
    top: '-5px',
    left: '-1px',
  },
});

const disabledClass = rule({
  op: 0.5,
});

export interface SliderHandleProps {
  /** Apply the active "being dragged" visual — slimmer, taller, with a soft outline. */
  dragging?: boolean;
  /** Dim the handle. */
  disabled?: boolean;
  /** Override the thumb background. Defaults to a metallic gray. */
  background?: string;
  /** Override the thumb box-shadow. Defaults to a chunky 3D drop shadow. */
  boxShadow?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SliderHandle: React.FC<SliderHandleProps> = ({
  dragging,
  disabled,
  background,
  boxShadow,
  className,
  style,
}) => {
  const dragSliderState = useDragSliderState();
  const effectiveDragging = dragging ?? dragSliderState?.dragging ?? false;
  const bg = background ?? DEFAULT_BG;
  const shadow = boxShadow ?? DEFAULT_SHADOW;
  const outerClass = containerClass + (disabled ? ' ' + disabledClass : '') + (className ? ' ' + className : '');
  const inner = thumbClass + (effectiveDragging ? ' ' + thumbDraggingClass : '');
  return (
    <span className={outerClass} style={style}>
      <span className={inner} style={{background: bg, boxShadow: shadow}} />
    </span>
  );
};
