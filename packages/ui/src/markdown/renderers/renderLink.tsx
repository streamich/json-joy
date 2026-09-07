import * as React from 'react';
import {Link} from 'react-router-lite';
import type {RenderNode} from '../types';

const renderLink: RenderNode = (renderers, flat, idx, props, state) => {
  const node = flat.nodes[idx] as any;
  let {url, title} = node;

  if (node.type === 'linkReference') {
    const definition = flat.nodes[flat.definitions[node.identifier]] as any;
    if (definition) {
      url = definition.url;
      title = definition.title;
    }
  }

  // An unresolved reference — e.g. stray "[...]" brackets, a bare "T[]", or a
  // "[text][id]" reference whose "[id]: url" definition is missing.
  if (url == null) {
    return <>{node.raw ?? renderers.children(renderers, flat, idx, props, state)}</>;
  }

  if (url[0] === '/') {
    return (
      <Link a to={url} title={title}>
        {renderers.children(renderers, flat, idx, props, state)}
      </Link>
    );
  }

  return (
    <a href={url} title={title} target="_blank" rel="noopener noreferrer">
      {renderers.children(renderers, flat, idx, props, state)}
    </a>
  );
};

export default renderLink;
