import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {SheetFieldGpuState} from './state';
import type {SheetFieldWebGpuProps} from './types';

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
 * WebGPU SheetField: one large draped satin sheet (a "blanket") twisted so it
 * fans, pinches to a waist, and fans again, rendered behind its children with a
 * single indexed draw. There is no fallback path - where WebGPU is unavailable
 * the canvas stays blank.
 *
 * All animation, GPU and lifecycle logic lives in {@link SheetFieldGpuState};
 * this component only forwards the root and canvas refs and injects the theme
 * `brand` palette as the default `colors`.
 *
 * @example
 * ```tsx
 * <SheetFieldWebGpu config={{twistTurns: 1.1, reactToMouse: true}} style={{height: 480}}>
 *   <h1>Explore json-joy</h1>
 * </SheetFieldWebGpu>
 * ```
 */
export const SheetFieldWebGpu: React.FC<SheetFieldWebGpuProps> = (props) => {
  const {config, state: stateProp, onState, className, style, children} = props;
  const styles = useStyles();
  const colorsProp = config?.colors;
  const colors = React.useMemo(() => colorsProp ?? styles.brand.map((c) => c.toString()), [colorsProp, styles]);
  const stateRef = React.useRef<SheetFieldGpuState | null>(stateProp ?? null);
  if (!stateRef.current) stateRef.current = stateProp ?? new SheetFieldGpuState({...config, colors});
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
