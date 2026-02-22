import * as React from 'react';
import type {RenderNode} from '../../../../markdown/types';

const renderParagraph: RenderNode = (renderers, ast, idx, props, state) => {
  const element = <p>{renderers.children(renderers, ast, idx, props, state)}</p>;

  return element;
};

export default renderParagraph;
