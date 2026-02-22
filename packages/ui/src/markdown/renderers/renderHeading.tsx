import * as React from 'react';
import type {RenderNode} from '../types';
import Heading from '../block/Heading';

const renderHeading: RenderNode = (renderers, ast, idx, props, state) => {
  return <Heading idx={idx}>{renderers.children(renderers, ast, idx, props, state)}</Heading>;
};

export default renderHeading;
