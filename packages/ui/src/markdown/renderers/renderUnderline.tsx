import * as React from 'react';
import type {RenderNode} from '../types';

const renderUnderline: RenderNode = (renderers, flat, idx, props, state) => (
  <u key={idx}>{renderers.children(renderers, flat, idx, props, state)}</u>
);

export default renderUnderline;
