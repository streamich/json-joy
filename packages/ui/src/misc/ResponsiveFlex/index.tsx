import * as React from 'react';
import {BoxSensor} from '../BoxSensor';
import type {BoxDimensions} from '../BoxSensor';

export interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width threshold in px. At or above this value children are laid out in a
   * horizontal row (wide mode); below it they stack in a column. Defaults to 600.
   */
  breakpoint?: number;
  /**
   * Render function called with `(wide, dims)` where `wide` is true when the
   * measured width is >= `breakpoint`. Use this to swap separator orientation or
   * conditionally render layout-specific elements.
   */
  render: (wide: boolean, dims: BoxDimensions) => React.ReactNode;
}

/**
 * Measures its own available width and renders children in a horizontal flex
 * row (`align-items: stretch`) when the width is at or above `breakpoint`, or
 * in a vertical flex column when below. The child render function receives
 * `(wide, dims)` so separators and orientation-aware elements can adapt.
 *
 * @example
 * ```tsx
 * <ResponsiveFlex breakpoint={700} render={(wide) => (
 *   <>
 *     <div>Left content</div>
 *     <Separator style={wide ? {width: '1px', height: 'auto'} : {}} />
 *     <div>Right content</div>
 *   </>
 * )} />
 * ```
 */
export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({breakpoint = 600, render, ...rest}) => (
  <BoxSensor
    {...rest}
    render={(dims) => {
      const wide = dims[2] >= breakpoint;
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: wide ? 'row' : 'column',
            alignItems: 'stretch',
          }}
        >
          {render(wide, dims)}
        </div>
      );
    }}
  />
);
