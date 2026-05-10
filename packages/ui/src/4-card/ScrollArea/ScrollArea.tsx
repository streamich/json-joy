import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
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

const shadowTopClass = drule({
  pointerEvents: 'none',
  trs: 'opacity .3s',
  pos: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  z: 2,
  h: '5px',
});

const shadowBottomClass = drule({
  pointerEvents: 'none',
  trs: 'opacity .3s',
  pos: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  z: 2,
  h: '5px',
});

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: ScrollState;
  alwaysVisible?: boolean;
  railWidth?: number;
  hideDelay?: number;
  minThumbSize?: number;
  shadow?: boolean;
  shadowFlat?: boolean;
  children: React.ReactNode;
}

const ScrollAreaShadows: React.FC<{state: ScrollState; flat?: boolean}> = ({state, flat}) => {
  const styles = useStyles();
  const shade = styles.light ? 0 : 1;
  const shadowGradient = (toDeg: number) =>
    `linear-gradient(${toDeg}deg, ${styles.g(shade, 0.05)}, ${styles.g(shade, 0.03)} 50%, ${styles.g(shade, 0)})`;
  const shadowTopCls = shadowTopClass({bg: shadowGradient(180)});
  const shadowBottomCls = shadowBottomClass({bg: shadowGradient(0)});
  const scrollTop = useSyncStore(state.scrollTop$);
  const maxScrollTop = useSyncStore(state.maxScrollTop$);
  const headerHeight = useSyncStore(state.headerHeight$);
  const footerHeight = useSyncStore(state.footerHeight$);
  const background = flat ? styles.g(0, 0.1) : void 0;
  const [showTopShadow, showBottomShadow] = getScrollShadowVisibility(scrollTop, maxScrollTop);

  return (
    <>
      <div
        className={shadowTopCls}
        style={{
          top: headerHeight,
          opacity: showTopShadow ? 1 : 0,
          background,
          height: flat ? 3 : void 0,
        }}
      />
      <div
        className={shadowBottomCls}
        style={{
          bottom: footerHeight,
          opacity: showBottomShadow ? 1 : 0,
          background,
          height: flat ? 3 : void 0,
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
  shadowFlat,
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
        {shadow || shadowFlat ? <ScrollAreaShadows state={state} flat={shadowFlat} /> : null}
      </div>
    </ctx.Provider>
  );
};
