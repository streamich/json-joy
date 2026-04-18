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

export const ScrollRail: React.FC<ScrollRailProps> = ({children = <Thumb />, className, style, ...rest}) => {
  const state = useScrollArea();
  const theme = useTheme();
  const visible = useSyncStore(state.visible$);
  const alwaysVisible = useSyncStore(state.alwaysVisible$);
  const railWidth = useSyncStore(state.railWidth$);
  const canScroll = useSyncStore(state.canScroll$);
  const isVisible = alwaysVisible || visible;

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
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        ...style,
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
