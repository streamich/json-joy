import * as React from 'react';
import {rule} from 'nano-theme';
import {ScrollArea, ScrollRail, useScrollArea, type ScrollAreaProps} from '../ScrollArea';

const viewportClass = rule({
  fl: '1 1 auto',
  minH: 0,
  w: '100%',
  bxz: 'border-box',
  ovy: 'auto',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  overscrollBehavior: 'contain',
  '&::-webkit-scrollbar': {d: 'none'},
});

const ScrollboxViewport: React.FC<{children: React.ReactNode}> = ({children}) => {
  const state = useScrollArea();
  return (
    <div ref={state.setViewport} className={viewportClass}>
      {children}
    </div>
  );
};

export interface ScrollboxProps extends Omit<ScrollAreaProps, 'children'> {
  children: React.ReactNode;
}

export const Scrollbox: React.FC<ScrollboxProps> = ({children, shadow = true, ...rest}) => {
  return (
    <ScrollArea shadow={shadow} railWidth={4} {...rest}>
      <ScrollboxViewport>{children}</ScrollboxViewport>
      <ScrollRail />
    </ScrollArea>
  );
};
