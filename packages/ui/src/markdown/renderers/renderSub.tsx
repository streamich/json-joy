import * as React from 'react';
import type {RenderNode} from '../types';

const renderSub: RenderNode = (renderers, flat, idx, props, state) => (
  <sub>{renderers.children(renderers, flat, idx, props, state)}</sub>
);

export default renderSub;
