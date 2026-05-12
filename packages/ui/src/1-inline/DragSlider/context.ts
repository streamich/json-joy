import * as React from 'react';

export interface DragSliderContextValue {
  /** True while the wrapping `<DragSlider>` is in an active drag. */
  dragging: boolean;
}

export const DragSliderContext = React.createContext<DragSliderContextValue | null>(null);

export const useDragSliderState = (): DragSliderContextValue | null => React.useContext(DragSliderContext);
