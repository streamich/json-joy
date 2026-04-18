import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import {useScrollArea} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';
import {Thumb} from './Thumb';

const blockClass = drule({
  pos: 'absolute',
  top: 0,
  r: 0,
  b: 0,
  trs: 'opacity .2s ease',
  z: 1,
});

export interface ScrollRailProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const addCssLength = (base: number, inset: React.CSSProperties['top']): React.CSSProperties['top'] => {
  if (inset === undefined) return base || undefined;
  if (typeof inset === 'number') return base + inset;
  if (!base) return inset;
  return `calc(${base}px + ${inset})`;
};

export const ScrollRail: React.FC<ScrollRailProps> = ({children = <Thumb />, className, style, ...rest}) => {
  const state = useScrollArea();
  const theme = useTheme();
  const visible = useSyncStore(state.visible$);
  const alwaysVisible = useSyncStore(state.alwaysVisible$);
  const railWidth = useSyncStore(state.railWidth$);
  const canScroll = useSyncStore(state.canScroll$);
  const headerHeight = useSyncStore(state.headerHeight$);
  const footerHeight = useSyncStore(state.footerHeight$);
  const isVisible = alwaysVisible || visible;
  const {top, bottom, ...restStyle} = style ?? {};

  if (!canScroll && !alwaysVisible) return null;

  return (
    <div
      {...rest}
      ref={state.setRail}
      className={
        blockClass({bg: theme.g(0, 0.04), '&:hover': {bg: theme.g(0, 0.08)}}) + (className ? ' ' + className : '')
      }
      data-state={isVisible ? 'visible' : 'hidden'}
      style={{
        width: railWidth,
        top: addCssLength(headerHeight, top),
        bottom: addCssLength(footerHeight, bottom),
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        ...restStyle,
      }}
      onPointerDown={state.onScrollbarPointerDown}
      onPointerMove={state.onScrollbarPointerMove}
      onPointerUp={state.onScrollbarPointerUp}
      onWheel={state.onScrollbarWheel}
      onPointerEnter={state.onScrollbarPointerEnter}
    >
      {children}
    </div>
  );
};
