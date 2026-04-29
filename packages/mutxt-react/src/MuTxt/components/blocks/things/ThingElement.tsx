import * as React from 'react';
import type {RenderElementProps} from 'slate-react';
import type {ThingElement as ThingElementType} from '../../../types';

export interface ThingElementProps extends RenderElementProps {
  element: ThingElementType;
}

/** Single hidden `.thing` payload row inside `.things`. */
export const ThingElement: React.FC<ThingElementProps> = ({attributes, children}) => (
  <div {...attributes} contentEditable={false} style={{display: 'none'}}>
    {children}
  </div>
);
