import * as React from 'react';
import type {RenderNode} from '../types';

const renderTableCell: RenderNode = (renderers, flat, idx, props, state) => {
  return <td key={idx}>{renderers.children(renderers, flat, idx, props, state)}</td>;
};

export default renderTableCell;
