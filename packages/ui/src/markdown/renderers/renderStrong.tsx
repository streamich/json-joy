import * as React from 'react';
import type {RenderNode} from '../types';

const renderStrong: RenderNode = (renderers, flat, idx, props, state) => (
  <strong>{renderers.children(renderers, flat, idx, props, state)}</strong>
);

export default renderStrong;
