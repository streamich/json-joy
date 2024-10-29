import * as React from 'react';
import {RendererMap} from '../../react/types';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';

const h = React.createElement;

export const renderers: RendererMap = {
  caret: (props, children) => h(RenderCaret, <any>props, children),
  focus: (props, children) => h(RenderFocus, <any>props, children),
  anchor: (props) => h(RenderAnchor, <any>props),
  inline: ({inline}, children, attributes) => {
    const attr = inline.attr();

    if (attr.b) {
      const style = attributes.style || (attributes.style = {});
      style.fontWeight = 'bold';
    }
    if (attr.i) {
      const style = attributes.style || (attributes.style = {});
      style.fontStyle = 'italic';
    }

    const selection = inline.selection();
    if (selection) {
      const style = attributes.style || (attributes.style = {});
      const [left, right] = selection;
      style.backgroundColor = '#d7e9fd';
      style.borderRadius =
        left === 'anchor' ? '.25em 1px 1px .25em' : right === 'anchor' ? '1px .25em .25em 1px' : '1px';
    }

    return children;
  },
  block: ({hash, block}, children) => {
    const isRoot = block.tag() === '';
    if (isRoot) return children;
    return h('div', {style: {padding: '16px 0'}}, children);
  },
};
