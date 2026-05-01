import * as React from 'react';
import {SizerState} from '../state';
import {SizerDivider} from './SizerDivider';
import {outerClass, contentClass} from './css';
import type {SizerProps} from '../types';

const DEFAULT_MIN_WIDTH = 200;

/**
 * Centered, resizable container with two floating dividers on its left and
 * right edges. Both paddings stay equal at all times - dragging either divider
 * grows or shrinks the content symmetrically.
 *
 * The dividers are positioned absolutely on the edges of the content box so
 * they don't consume horizontal space - the content can stretch all the way
 * to the container's boundaries.
 *
 * @example
 * ```tsx
 * const sizer = new SizerState(800);
 * <Sizer state={sizer}>
 *   <Editor />
 * </Sizer>
 * ```
 */
export const Sizer: React.FC<SizerProps> = ({
  state: stateProp,
  onState,
  minWidth = DEFAULT_MIN_WIDTH,
  resizable = true,
  handleMargin,
  handleWidth,
  handlePadding,
  handleMaxHeight,
  className,
  style,
  children,
}) => {
  const stateRef = React.useRef<SizerState | null>(stateProp ?? null);
  if (!stateRef.current) stateRef.current = stateProp ?? new SizerState();
  const state = stateRef.current;

  React.useEffect(() => {
    onState?.(state);
  }, [state, onState]);

  const containerWidth = state.width.use();
  const desired = state.content.use();
  const contentWidth =
    containerWidth === 0 ? desired : Math.max(minWidth, Math.min(desired, containerWidth));

  const cls = className ? `${outerClass} ${className}` : outerClass;

  return (
    <div ref={state.box.setEl} className={cls} style={style}>
      <div className={contentClass} style={{width: contentWidth}}>
        {children}
        {resizable && containerWidth > 0 && (
          <>
            <SizerDivider
              state={state}
              side="left"
              minWidth={minWidth}
              handleMargin={handleMargin}
              handleWidth={handleWidth}
              handlePadding={handlePadding}
              handleMaxHeight={handleMaxHeight}
            />
            <SizerDivider
              state={state}
              side="right"
              minWidth={minWidth}
              handleMargin={handleMargin}
              handleWidth={handleWidth}
              handlePadding={handlePadding}
              handleMaxHeight={handleMaxHeight}
            />
          </>
        )}
      </div>
    </div>
  );
};
