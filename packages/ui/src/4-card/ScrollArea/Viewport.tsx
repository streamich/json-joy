import * as React from 'react';
import {rule} from 'nano-theme';
import {useScrollArea} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';
import type {ScrollAreaViewportProps} from './types';

const wrapClass = rule({
  fl: '1',
  pos: 'relative',
  ov: 'hidden',
});

const viewportClass = rule({
  w: '100%',
  h: '100%',
  bxz: 'border-box',
  ovy: 'scroll',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  // overscrollBehavior: 'contain',
  '&::-webkit-scrollbar': {
    d: 'none',
  },
});

const contentClass = rule({
  minW: '100%',
  minH: '100%',
  d: 'flex',
});

const addCssLength = (base: number, inset: React.CSSProperties['paddingTop']): React.CSSProperties['paddingTop'] => {
  if (inset === undefined) return base || undefined;
  if (typeof inset === 'number') return base + inset;
  if (!base) return inset;
  return `calc(${base}px + ${inset})`;
};

export const Viewport: React.FC<ScrollAreaViewportProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const headerHeight = useSyncStore(state.headerHeight$);
  const footerHeight = useSyncStore(state.footerHeight$);
  const {paddingTop, paddingBottom, ...restStyle} = style ?? {};

  return (
    <div className={wrapClass}>
      <div
        {...rest}
        ref={state.setViewport}
        className={viewportClass + (className ? ' ' + className : '')}
        style={{
          paddingTop: addCssLength(headerHeight, paddingTop),
          paddingBottom: addCssLength(footerHeight, paddingBottom),
          ...restStyle,
        }}
      >
        <div className={contentClass}>{children}</div>
      </div>
    </div>
  );
};
