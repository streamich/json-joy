import * as React from 'react';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';
import {RenderInline} from './RenderInline';
import {DefaultRendererColors} from './constants';
import type {RendererMap} from '../../react/types';

const h = React.createElement;

export const renderers: RendererMap = {
  text: (props, inline) => {
    const style = (props.style || (props.style = {})) as React.CSSProperties;
    const attr = inline.attr();
    
    if (attr.b) {
      style.fontWeight = 'bold';
    }
    if (attr.i) {
      style.fontStyle = 'italic';
    }
    
    const selection = inline.selection();
    if (selection) {
      const [left, right] = selection;
      // style.backgroundColor = focus ? DefaultRendererColors.ActiveSelection : DefaultRendererColors.InactiveSelection;
      style.backgroundColor = DefaultRendererColors.ActiveSelection;
      style.borderRadius =
        left === 'anchor' ? '.25em 1px 1px .25em' : right === 'anchor' ? '1px .25em .25em 1px' : '1px';
    }

    return props;
  },
  caret: (props, children) => h(RenderCaret, <any>props, children),
  focus: (props, children) => h(RenderFocus, <any>props, children),
  anchor: (props) => h(RenderAnchor, <any>props),
  inline: (props, children) => h(RenderInline, props as any, children),
  block: ({hash, block}, children) => {
    const isRoot = block.tag() === '';
    if (isRoot) return children;
    return h('div', {style: {padding: '16px 0'}}, children);
  },
};
