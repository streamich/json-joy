import * as React from 'react';
import type {RenderElementProps} from 'slate-react';
import type {ThingsContainerElement as ThingsContainerElementType} from '../../../types';

export interface ThingsElementProps extends RenderElementProps {
  element: ThingsContainerElementType;
}

/**
 * Hidden system container. `display: none` removes it from layout, paint,
 * hit-testing, and the accessibility tree, while still emitting `{children}`
 * so Slate's DOM-to-model selection mapping works.
 */
export const ThingsElement: React.FC<ThingsElementProps> = ({attributes, children}) => (
  <div {...attributes} contentEditable={false} style={{display: 'none'}}>
    {children}
  </div>
);
