import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {LiquidLayersGpuState} from './state';
import type {LiquidLayersWebGpuProps} from './types';

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
 * WebGPU LiquidLayers: a stack of liquid layers whose metaball blobs split and
 * merge as they drift, casting soft crescent shadows on the layer beneath, drawn
 * behind its children with a single full-screen fragment pass. There is no
 * fallback path - where WebGPU is unavailable the canvas stays blank.
 *
 * All animation, GPU and lifecycle logic lives in {@link LiquidLayersGpuState};
 * this component only forwards the root and canvas refs and injects the theme
 * `brand` palette as the default `colors`.
 *
 * @example
 * ```tsx
 * <LiquidLayersWebGpu config={{count: 7, reactToMouse: 'attract'}} style={{height: 480}}>
 *   <h1>Explore json-joy</h1>
 * </LiquidLayersWebGpu>
 * ```
 */
export const LiquidLayersWebGpu: React.FC<LiquidLayersWebGpuProps> = (props) => {
  const {config, state: stateProp, onState, className, style, children} = props;
  const styles = useStyles();
  const colorsProp = config?.colors;
  const colors = React.useMemo(() => colorsProp ?? styles.brand.map((c) => c.toString()), [colorsProp, styles]);
  const stateRef = React.useRef<LiquidLayersGpuState | null>(stateProp ?? null);
  if (!stateRef.current) stateRef.current = stateProp ?? new LiquidLayersGpuState({...config, colors});
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
