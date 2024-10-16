import * as React from 'react';
import {RendererMap} from "../../react/types";
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';

const h = React.createElement;

export const renderers: RendererMap = {
  caret: (props, children) => h(RenderCaret, <any>props, children),
  focus: (props, children) => h(RenderFocus, <any>props, children),
  anchor: (props) => h(RenderAnchor, <any>props),
  inline: ({inline}, children, attributes) => {
    if (inline.attr()['b']) {
      (attributes.style || (attributes.style = {})).fontWeight = 'bold';
    }
    if (inline.attr()['i']) {
      (attributes.style || (attributes.style = {})).fontStyle = 'italic';
    }
    return children;
  },
};
