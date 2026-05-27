import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {StickFieldState} from './state';
import type {StickFieldProps} from './types';

const rootClass = rule({
  pos: 'relative',
});

const canvasClass = rule({
  pos: 'absolute',
  top: 0,
  left: 0,
  w: '100%',
  h: '100%',
  d: 'block',
  pointerEvents: 'none',
});

/**
 * A floating cloud of short sticks arranged on a breathing sphere, rendered on
 * a 2D canvas behind its children. Cheap to run and degrades to a blank
 * background where canvas is unavailable or motion is reduced.
 *
 * Place content as children; the canvas sits behind it and never intercepts
 * pointer events. Pass `reactToMouse` to make the cloud tilt toward the cursor.
 *
 * @example
 * ```tsx
 * <StickField reactToMouse style={{height: 480}}>
 *   <h1>Explore json-joy</h1>
 * </StickField>
 * ```
 */
export const StickField: React.FC<StickFieldProps> = (props) => {
  const {state: stateProp, onState, className, style, children, colors: colorsProp, ...opts} = props;
  const styles = useStyles();
  const colors = React.useMemo(() => colorsProp ?? styles.brand.map((c) => c.toString()), [colorsProp, styles]);
  const stateRef = React.useRef<StickFieldState | null>(stateProp ?? null);
  if (!stateRef.current) stateRef.current = stateProp ?? new StickFieldState(opts);
  const state = stateRef.current;
  state.setOptions({...opts, colors});

  React.useEffect(() => {
    onState?.(state);
  }, [state, onState]);

  React.useEffect(() => {
    state.start();
    return () => state.dispose();
  }, [state]);

  return (
    <div ref={state.setRoot} className={className ? `${rootClass} ${className}` : rootClass} style={style}>
      <canvas ref={state.setCanvas} className={canvasClass} />
      {children}
    </div>
  );
};
