import * as React from 'react';
import type {RenderNode} from '../../../../markdown/types';
import renderLinkDefault from '../../../../markdown/renderers/renderLink';

const renderLink: RenderNode = (renderers, ast, idx, props, state) => {
  const node = ast.nodes[idx] as any;
  const {url} = node;
  const {title} = node;

  switch (url[0]) {
    case '#': {
      return (
        <a href={url} title={title}>
          {renderers.children(renderers, ast, idx, props, state)}
        </a>
      );
    }
  }

  return renderLinkDefault(renderers, ast, idx, props, state);
};

export default renderLink;
