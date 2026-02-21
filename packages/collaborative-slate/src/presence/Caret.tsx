import * as React from 'react';
import {rule, keyframes} from 'nano-theme';
import type {PresenceCaretInfo} from './types';

const blinkAnimation = keyframes({
  '0%, 100%': {borderLeftColor: 'var(--peritext-cursor-color)'},
  '50%': {borderLeftColor: 'transparent'},
});

const labelFadeAnimation = keyframes({
  from: {opacity: 1, transform: 'translateX(-50%) translateY(0)'},
  to: {opacity: 0, transform: 'translateX(-50%) translateY(4px)'},
});

/** Cursor lifecycle: dim at 50% of the duration, disappear at 100%. */
const lifecycleAnimation = keyframes({
  '0%': {opacity: 1},
  '49.9%': {opacity: 1},
  '50%': {opacity: 0.3},
  '99.9%': {opacity: 0.3},
  '100%': {opacity: 0},
});

const cursorLabelClass = rule({
  pos: 'absolute',
  bottom: 'calc(100% + 1px)',
  left: '50%',
  transform: 'translateX(-50%) translateY(0)',
  whiteSpace: 'nowrap',
  fz: '11px',
  fontWeight: 600,
  lineHeight: 1.2,
  pd: '1px 4px',
  bdrad: '3px',
  col: '#fff',
  pe: 'none',
  us: 'none',
  op: 1,
  z: 10,
});

const cursorClass = rule({
  pos: 'relative',
  d: 'inline',
  bdl: '2px solid',
  ml: '-1px',
  mr: '-1px',
  pe: 'none',
  wordBreak: 'normal',
  [`&:hover .${cursorLabelClass}`]: {
    op: 1,
    transform: 'translateX(-50%) translateY(0)',
    z: 20,
  },
});

export interface CaretProps {
  info: PresenceCaretInfo;
}

/**
 * React component that renders a colorful non-interactive caret for a remote
 * peer. Lifecycles (blink, label fade, dim, hide) handled by CSS — no JS
 * timers needed.
 */
export const Caret: React.FC<CaretProps> = React.memo(({info}) => {
  const {color, name, fadeAfterMs, dimAfterMs, hideAfterMs, receivedAt} = info;
  const blinkIterations = Math.ceil(dimAfterMs / 1000);
  const age = Date.now() - receivedAt;

  const elStyle: React.CSSProperties = {
    borderColor: color,
    ['--peritext-cursor-color' as any]: color,
    animation: `${lifecycleAnimation} ${hideAfterMs}ms linear forwards, ${blinkAnimation} 1s ease-in-out ${blinkIterations} forwards`,
    animationDelay: age > 0
      ? `-${age}ms, ${-(Date.now() % 1000)}ms`
      : `0ms, ${-(Date.now() % 1000)}ms`,
  };

  const labelStyle: React.CSSProperties = {
    backgroundColor: color,
    ...(fadeAfterMs > 0
      ? {animation: `${labelFadeAnimation} 0.3s ease ${fadeAfterMs}ms forwards`}
      : {}),
  };

  return (
    <span className={cursorClass} style={elStyle} contentEditable={false}>
      {'\u2060'}
      <span className={cursorLabelClass} style={labelStyle}>
        {name}
      </span>
      {'\u2060'}
    </span>
  );
});

Caret.displayName = 'PresenceCaret';
