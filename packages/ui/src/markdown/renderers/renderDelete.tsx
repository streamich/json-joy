import * as React from 'react';
import type {RenderNode} from '../types';

const renderDelete: RenderNode = (renderers, flat, idx, props, state) => (
  <del>{renderers.children(renderers, flat, idx, props, state)}</del>
);

export default renderDelete;
