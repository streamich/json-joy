import * as React from 'react';
import type {RenderNode} from '../types';
import {rule} from 'nano-theme';
import type {IFootnoteReference} from 'very-small-parser/lib/markdown';

const blockClass = rule({
  fz: '.68em',
  op: 0.8,
  letterSpacing: '0.05em',
  cur: 'default',
});

const braceClass = rule({
  op: 0.35,
  [`.${blockClass.trim()}:hover &`]: {
    op: 1,
  },
});

const renderFootnoteReference: RenderNode = (renderers, flat, idx) => {
  const node = flat.nodes[idx] as IFootnoteReference;
  const {value = ''} = node;
  const definition = flat.nodes[flat.footnotes[value]] as any;

  return (
    <sup className={blockClass} title={value}>
      <span className={braceClass}>[</span>
      {definition.cnt}
      <span className={braceClass}>]</span>
    </sup>
  );
};

export default renderFootnoteReference;
