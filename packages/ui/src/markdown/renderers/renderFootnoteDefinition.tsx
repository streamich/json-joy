import * as React from 'react';
import {rule} from 'nano-theme';
import type {RenderNode} from '../types';
import type {IFootnoteDefinition} from 'very-small-parser/lib/markdown/block/types';

const blockClass = rule({});

const identifierClass = rule({
  op: 0.4,
  pad: '0 16px 0 0',
  [`.${blockClass.trim()}:hover &`]: {
    op: 0.8,
  },
});

const contentClass = rule({
  w: '100%',
});

const renderFootnoteDefinition: RenderNode = (renderers, flat, idx, props, state) => {
  const node = flat.nodes[idx] as IFootnoteDefinition;
  if (!node) return null;

  const {identifier} = node;

  return (
    <tr key={idx} className={blockClass}>
      <td className={identifierClass} title={identifier}>
        {(node as any).cnt}
      </td>
      <td className={contentClass}>{renderers.children(renderers, flat, idx, props, state)}</td>
    </tr>
  );
};

export default renderFootnoteDefinition;
