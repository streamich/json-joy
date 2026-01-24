import * as React from 'react';
import {rule, useTheme} from 'nano-theme';

const wrapClass = rule({
  pos: 'relative',
  d: 'flex',
  w: '100%',
  h: '100%',
});

const blockClass = rule({
  w: '100%',
  ovy: 'auto',
});

const shadowTopClass = rule({
  pointerEvents: 'none',
  trs: 'opacity .3s',
  pos: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  h: '4px',
  bg: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.01) 100%)',
});

const shadowBottomClass = rule({
  pointerEvents: 'none',
  trs: 'opacity .3s',
  pos: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  h: '4px',
  bg: 'linear-gradient(0deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.01) 100%)',
});

export interface ScrollboxProps extends React.AllHTMLAttributes<any> {
  children: React.ReactNode;
}

export const Scrollbox: React.FC<ScrollboxProps> = ({children, ...rest}) => {
  const theme = useTheme();
  const [shadows, setShadows] = React.useState<[top: boolean, bottom: boolean]>([false, false]);
  const ref = React.useRef<HTMLDivElement>(null);
  const checkShadows = React.useCallback(() => {
    const div = ref.current;
    if (!div) return;
    const showTopShadow = div.scrollTop > 4;
    const showBottomShadow = div.scrollTop + div.clientHeight < div.scrollHeight - 4;
    setShadows([showTopShadow, showBottomShadow]);
  }, []);

  // Check shadow state on every scroll.
  React.useEffect(() => {
    const div = ref.current;
    if (!div) return;
    div.addEventListener('scroll', checkShadows);
    return () => {
      div.removeEventListener('scroll', checkShadows);
    };
  }, [checkShadows]);

  // Check shadow state on mount.
  React.useEffect(checkShadows, []);

  const background = theme.isLight ? undefined : 'rgba(255,255,255,.1)';

  return (
    <div className={wrapClass}>
      <div {...rest} ref={ref} className={(rest.className || '') + blockClass}>
        {children}
      </div>
      <div className={shadowTopClass} style={{opacity: shadows[0] ? 1 : 0, background}} />
      <div className={shadowBottomClass} style={{opacity: shadows[1] ? 1 : 0, background}} />
    </div>
  );
};
