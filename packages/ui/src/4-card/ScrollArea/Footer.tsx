import * as React from 'react';
import {rule} from 'nano-theme';
import {useScrollArea} from './context';
import type {ScrollAreaFooterProps} from './types';

const footerClass = rule({
  fls: '0',
  pos: 'absolute',
  l: 0,
  r: 0,
  b: 0,
  z: 2,
});

export const Footer: React.FC<ScrollAreaFooterProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) state.footerHeight$.next(entry.contentRect.height);
    });
    observer.observe(el);
    state.footerHeight$.next(el.offsetHeight);
    return () => {
      observer.disconnect();
      state.footerHeight$.next(0);
    };
  }, [state]);

  return (
    <div {...rest} ref={ref} className={footerClass + (className ? ' ' + className : '')} style={style}>
      {children}
    </div>
  );
};
