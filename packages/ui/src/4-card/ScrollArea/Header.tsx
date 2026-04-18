import * as React from 'react';
import {rule} from 'nano-theme';
import {useScrollArea} from './context';
import type {ScrollAreaHeaderProps} from './types';

const headerClass = rule({
  fls: '0',
  pos: 'absolute',
  top: 0,
  l: 0,
  r: 0,
  z: 2,
});

export const Header: React.FC<ScrollAreaHeaderProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) state.headerHeight$.next(entry.contentRect.height);
    });
    observer.observe(el);
    state.headerHeight$.next(el.offsetHeight);
    return () => {
      observer.disconnect();
      state.headerHeight$.next(0);
    };
  }, [state]);

  return (
    <div {...rest} ref={ref} className={headerClass + (className ? ' ' + className : '')} style={style}>
      {children}
    </div>
  );
};
