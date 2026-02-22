import * as React from 'react';
import type {RenderNode} from '../types';

const renderSup: RenderNode = (renderers, flat, idx, props, state) => (
  <sup key={idx}>{renderers.children(renderers, flat, idx, props, state)}</sup>
);

export default renderSup;
