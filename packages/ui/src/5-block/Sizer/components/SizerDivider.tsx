import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';
import {outerClass, contentClass} from './css';
import type {SizerDividerProps} from '../types';

const HIT_AREA = 17;
const HOVER_W = 5;
const ACTIVE_W = 3;
const HOVER_INSET = 2;
const ACTIVE_INSET = 8;

const blockClass = rule({
  pos: 'absolute',
  top: 0,
  bottom: 0,
  bxz: 'border-box',
  us: 'none',
  z: 2,
  op: 0,
  trs: 'opacity .15s',
  '&:focus': {
    out: 'none',
  },
  [`.${outerClass.trim()}:hover &`]: {
    op: 1,
  },
  [`.${outerClass.trim()}:has(.${contentClass.trim()}:hover) &:not(:hover)`]: {
    op: 0,
  },
  '&.dragging': {
    op: 1,
  },
});

const NO_MAX = '100vmax';

const handleClass = drule({
  pos: 'absolute',
  top: '50%',
  bxz: 'border-box',
  bdrad: '2px',
  trs: 'background .3s, width .06s, height .06s',
  w: 'var(--sz-hw, 1px)',
  h: `min(var(--sz-hmh, ${NO_MAX}), calc(100% - 2 * var(--sz-hp, 0px)))`,
  [`.${blockClass.trim()}:hover &`]: {
    w: HOVER_W + 'px',
    h: `min(calc(var(--sz-hmh, ${NO_MAX}) - ${2 * HOVER_INSET}px), calc(100% - ${2 * HOVER_INSET}px - 2 * var(--sz-hp, 0px)))`,
  },
  [`.${blockClass.trim()}:focus &`]: {
    w: ACTIVE_W + 'px',
    h: `min(calc(var(--sz-hmh, ${NO_MAX}) - ${2 * ACTIVE_INSET}px), calc(100% - ${2 * ACTIVE_INSET}px - 2 * var(--sz-hp, 0px)))`,
  },
  [`.${blockClass.trim()}.dragging &`]: {
    w: ACTIVE_W + 'px',
    h: `min(calc(var(--sz-hmh, ${NO_MAX}) - ${2 * ACTIVE_INSET}px), calc(100% - ${2 * ACTIVE_INSET}px - 2 * var(--sz-hp, 0px)))`,
  },
});

const KEY_STEP = 10;
const KEY_LARGE_STEP = 50;

export const SizerDivider: React.FC<SizerDividerProps> = ({
  state,
  width,
  side,
  minWidth,
  disabled,
  handleMargin = 0,
  handleWidth = 1,
  handlePadding = 0,
  handleMaxHeight,
}) => {
  const styles = useStyles();
  const dragging = state.dragging.use();
  const [focused, setFocused] = React.useState(false);
  const active = dragging || focused;

  const sideSign = side === 'left' ? -1 : 1;

  const apply = React.useCallback(
    (delta: number) => {
      const max = state.width.value;
      let next = width.value + delta;
      if (next < minWidth) next = minWidth;
      if (next > max) next = max;
      if (next !== width.value) width.next(next);
    },
    [state, width, minWidth],
  );

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width.value;
      const el = e.currentTarget;
      const pointerId = e.pointerId;
      el.setPointerCapture?.(pointerId);
      state.dragging.next(true);

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        const dx = ev.clientX - startX;
        const max = state.width.value;
        let next = startWidth + sideSign * 2 * dx;
        if (next < minWidth) next = minWidth;
        if (next > max) next = max;
        if (next !== width.value) width.next(next);
      };

      const cleanup = () => {
        if (el.hasPointerCapture?.(pointerId)) el.releasePointerCapture(pointerId);
        state.dragging.next(false);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        cleanup();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [state, width, sideSign, minWidth, disabled],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const arrow = e.key === 'ArrowLeft' ? -1 : 1;
      const step = e.shiftKey ? KEY_LARGE_STEP : KEY_STEP;
      apply(arrow * sideSign * step);
    },
    [disabled, apply, sideSign],
  );

  const handleColor = active ? styles.col.accent(0, 5) : styles.g(0, 0.16);
  const blockStyle: React.CSSProperties = {
    [side]: -(handleMargin + HIT_AREA / 2),
    width: handleMargin + HIT_AREA,
    cursor: disabled ? 'default' : 'col-resize',
    touchAction: 'none',
  };
  const handleStyle: React.CSSProperties = {
    [side]: HIT_AREA / 2,
    transform: side === 'left' ? 'translate(-50%, -50%)' : 'translate(50%, -50%)',
    ['--sz-hw' as any]: handleWidth + 'px',
    ['--sz-hp' as any]: handlePadding + 'px',
    ...(handleMaxHeight !== undefined && {['--sz-hmh' as any]: handleMaxHeight + 'px'}),
  };

  return (
    <div
      contentEditable={false}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={width.value}
      aria-valuemin={minWidth}
      aria-valuemax={state.width.value}
      tabIndex={disabled ? -1 : 0}
      className={blockClass + (active ? ' dragging' : '')}
      style={blockStyle}
      onPointerDown={disabled ? undefined : onPointerDown}
      onKeyDown={disabled ? undefined : onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-sizer-side={side}
    >
      <div
        contentEditable={false}
        className={handleClass({
          bg: handleColor,
        })}
        style={handleStyle}
      />
    </div>
  );
};
