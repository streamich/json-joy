import * as React from 'react';
import {rule} from 'nano-theme';
import {ScrollState} from './state';
import {ctx} from './context';

const rootClass = rule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  ov: 'hidden',
  z: 10,
});

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: ScrollState;
  alwaysVisible?: boolean;
  railWidth?: number;
  hideDelay?: number;
  minThumbSize?: number;
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  state: _state,
  alwaysVisible,
  railWidth,
  hideDelay,
  minThumbSize,
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
      </div>
    </ctx.Provider>
  );
};
