import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {useScrollArea} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';
import type {ScrollState} from './state';

const MAX_BORDER_RADIUS = 4;

const thumbClass = drule({
  pos: 'absolute',
  l: 0,
  r: 0,
  bdrad: '4px',
  trs: 'background 0.1s ease',
  us: 'none',
  cur: 'ns-resize',
});

export interface ThumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: (style: React.CSSProperties, state: ScrollState) => React.ReactNode;
}

export const Thumb: React.FC<ThumbProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const styles = useStyles();
  useSyncStore(state.scrollRatio$);
  useSyncStore(state.thumbRatio$);
  const canScroll = useSyncStore(state.canScroll$);
  const dragging = useSyncStore(state.dragging$);
  const railDragging = useSyncStore(state.railDragging$);
  const railEl = state.railEl;
  const railHeight = railEl ? railEl.clientHeight : 0;
  const thumbH = state.thumbHeight(railHeight);
  const thumbT = state.thumbTop(railHeight);

  if (!canScroll) return null;

  const isDragging = dragging || railDragging;

  const topBorderRadius = Math.min(MAX_BORDER_RADIUS, thumbT / 3);
  const bottomBorderRadius = Math.min(MAX_BORDER_RADIUS, (railHeight - thumbT - thumbH) / 3);

  const computedStyle: React.CSSProperties = {
    height: thumbH,
    transform: `translate3d(0, ${thumbT}px, 0)`,
    borderRadius: `${topBorderRadius}px ${topBorderRadius}px ${bottomBorderRadius}px ${bottomBorderRadius}px`,
    ...style,
  };

  if (typeof children === 'function') {
    return (
      <div
        ref={state.setThumb}
        onPointerDown={state.onThumbPointerDown}
        onPointerMove={state.onThumbPointerMove}
        onPointerUp={state.onThumbPointerUp}
      >
        {children(computedStyle, state)}
      </div>
    );
  }

  return (
    <div
      {...rest}
      ref={state.setThumb}
      className={
        thumbClass({bg: styles.g(0, isDragging ? 0.48 : 0.24), '&:hover': {bg: styles.g(0, 0.48)}}) +
        (className ? ' ' + className : '')
      }
      style={computedStyle}
      onPointerDown={state.onThumbPointerDown}
      onPointerMove={state.onThumbPointerMove}
      onPointerUp={state.onThumbPointerUp}
    />
  );
};
