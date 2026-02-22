import * as React from 'react';
import type {RenderNode} from '../types';

const renderTableRow: RenderNode = (renderers, flat, idx, props, state) => {
  return <tr key={idx}>{renderers.children(renderers, flat, idx, props, state)}</tr>;
};

export default renderTableRow;
