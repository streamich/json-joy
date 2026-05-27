import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {StickFieldGlState} from './state';
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
 * A floating cloud of short round-capped sticks on a breathing sphere, rendered
 * with raw WebGL2 behind its children. The whole per-stick adjustment loop runs
 * on the GPU via one instanced draw call, so it scales to 100k+ sticks. There is
 * no fallback: where WebGL2 is unavailable, or motion is reduced, it renders a
 * blank background.
 *
 * Place content as children; the canvas sits behind it and never intercepts
 * pointer events. Pass `reactToMouse` to make the cloud tilt toward the cursor.
 *
 * @example
 * ```tsx
 * <StickFieldWebGl config={{reactToMouse: true}} style={{height: 480}}>
 *   <h1>Explore json-joy</h1>
 * </StickFieldWebGl>
 * ```
 */
export const StickFieldWebGl: React.FC<StickFieldProps> = (props) => {
  const {config, state: stateProp, onState, className, style, children} = props;
  const styles = useStyles();
  const colors = React.useMemo(() => config?.colors ?? styles.brand.map((c) => c.toString()), [config?.colors, styles]);
  const stateRef = React.useRef<StickFieldGlState | null>(stateProp ?? null);
  if (!stateRef.current) stateRef.current = stateProp ?? new StickFieldGlState(config ?? {});
  const state = stateRef.current;
  state.setOptions({...config, colors});

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
