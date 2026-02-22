import * as React from 'react';
import type {RenderNode} from '../types';
import Placeholder from '../placeholders/PlaceholderLazy';
import PlaceholderContainer from '../placeholders/PlaceholderContainer';

const {createElement, Fragment} = React;

const renderChildren: RenderNode = (renderers, flat, idx, props, context) => {
  const node = flat.nodes[idx];
  if (!node || !node.children) return null;

  const areChildrenOfRootNode = node.idx === 0;
  const needToRenderPlaceholders = context.placeholdersAfter && node.children.length > context.placeholdersAfter;

  let renderLimit = node.children.length;
  if (areChildrenOfRootNode && needToRenderPlaceholders) {
    renderLimit = Math.min(context.placeholdersAfter, renderLimit);
  }

  const elements: React.ReactNode[] = [];

  for (let i = 0; i < renderLimit; i++) {
    const idx = node.children[i];
    elements.push(createElement(Fragment, {key: idx}, renderers.node(renderers, flat, idx, props, context)));
  }

  if (areChildrenOfRootNode && needToRenderPlaceholders) {
    const lastPlaceholderIndex = Math.min(node.children.length, renderLimit + (props.maxPlaceholders || 20));
    const placeholders: React.ReactNode[] = [];
    for (let i = renderLimit; i < lastPlaceholderIndex; i++) {
      const idx = node.children[i];
      placeholders.push(<Placeholder key={idx} idx={idx} />);
    }
    elements.push(
      props.to ? (
        <PlaceholderContainer key="placeholders" to={props.to}>
          {placeholders}
        </PlaceholderContainer>
      ) : (
        <div>{placeholders}</div>
      ),
    );
  }

  return elements;
};

export default renderChildren;
