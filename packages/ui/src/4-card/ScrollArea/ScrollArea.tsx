import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {ScrollState} from './state';
import {ctx} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';
import {getScrollShadowVisibility} from '../scrollShadows';

const rootClass = rule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  ov: 'hidden',
  z: 10,
});

const shadowTopClass = rule({
  pointerEvents: 'none',
  trs: 'opacity .3s',
  pos: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  z: 2,
  h: '5px',
  bg: 'linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.03) 50%, rgba(0,0,0,0))',
});

const shadowBottomClass = rule({
  pointerEvents: 'none',
  trs: 'opacity .3s',
  pos: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  z: 2,
  h: '5px',
  bg: 'linear-gradient(0deg, rgba(0,0,0,.05), rgba(0,0,0,.03) 50%, rgba(0,0,0,0))',
});

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: ScrollState;
  alwaysVisible?: boolean;
  railWidth?: number;
  hideDelay?: number;
  minThumbSize?: number;
  shadow?: boolean;
  children: React.ReactNode;
}

const ScrollAreaShadows: React.FC<{state: ScrollState}> = ({state}) => {
  const theme = useTheme();
  const scrollTop = useSyncStore(state.scrollTop$);
  const maxScrollTop = useSyncStore(state.maxScrollTop$);
  const headerHeight = useSyncStore(state.headerHeight$);
  const footerHeight = useSyncStore(state.footerHeight$);
  const background = theme.isLight ? undefined : 'rgba(255,255,255,.1)';
  const [showTopShadow, showBottomShadow] = getScrollShadowVisibility(scrollTop, maxScrollTop);

  return (
    <>
      <div
        className={shadowTopClass}
        style={{
          top: headerHeight,
          opacity: showTopShadow ? 1 : 0,
          background,
        }}
      />
      <div
        className={shadowBottomClass}
        style={{
          bottom: footerHeight,
          opacity: showBottomShadow ? 1 : 0,
          background,
        }}
      />
    </>
  );
};

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  state: _state,
  alwaysVisible,
  railWidth,
  hideDelay,
  minThumbSize,
  shadow,
  children,
  className,
  ...rest
}) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: props are synced via useLayoutEffect below; only _state should trigger re-creation
  const state = React.useMemo(() => {
    if (_state) return _state;
    return new ScrollState({alwaysVisible, railWidth, hideDelay, minThumbSize});
  }, [_state]);

  React.useLayoutEffect(() => {
    if (!_state) {
      if (alwaysVisible !== undefined) state.alwaysVisible$.next(alwaysVisible);
      if (railWidth !== undefined) state.railWidth$.next(railWidth);
    }
  }, [alwaysVisible, railWidth, _state, state]);

  React.useLayoutEffect(() => state.start(), [state]);

  return (
    <ctx.Provider value={state}>
      <div {...rest} className={rootClass + (className ? ' ' + className : '')}>
        {children}
        {shadow ? <ScrollAreaShadows state={state} /> : null}
      </div>
    </ctx.Provider>
  );
};
