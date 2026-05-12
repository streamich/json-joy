import * as React from 'react';

export type DragSliderAxis = 'x' | 'y' | 'both';

export interface DragSliderContextValue {
  /** True while the wrapping `<DragSlider>` is in an active drag. */
  dragging: boolean;
  /** Axis the wrapping `<DragSlider>` is configured for. */
  axis: DragSliderAxis;
}

export const DragSliderContext = React.createContext<DragSliderContextValue | null>(null);

export const useDragSliderState = (): DragSliderContextValue | null => React.useContext(DragSliderContext);
