import * as React from 'react';
import {rule} from 'nano-theme';
import {useScrollArea} from './context';
import type {ScrollAreaViewportProps} from './types';

const wrapClass = rule({
  fl: '1',
  pos: 'relative',
  ov: 'hidden',
});

const viewportClass = rule({
  w: '100%',
  h: '100%',
  ovy: 'scroll',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    d: 'none',
  },
});

const contentClass = rule({
  minW: '100%',
  minH: '100%',
  d: 'flex',
});

export const Viewport: React.FC<ScrollAreaViewportProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();

  return (
    <div className={wrapClass}>
      <div
        {...rest}
        ref={state.setViewport}
        className={viewportClass + (className ? ' ' + className : '')}
        style={style}
      >
        <div className={contentClass}>{children}</div>
      </div>
    </div>
  );
};
