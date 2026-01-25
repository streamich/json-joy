import * as React from 'react';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';
import {RenderInline} from './RenderInline';
import {RenderPeritext} from './RenderPeritext';
import {RenderBlock} from './RenderBlock';
import {text} from './text';
import type {PeritextPlugin} from '../../react/types';

const h = React.createElement;

export const defaultPlugin: PeritextPlugin = {
  text,
  caret: (props, children) => h(RenderCaret, <any>props, children),
  focus: (props, children) => h(RenderFocus, <any>props, children),
  anchor: (props) => h(RenderAnchor, <any>props),
  inline: (props, children) => h(RenderInline, props as any, children),
  block: (props, children) => h(RenderBlock, props as any, children),
  peritext: (children, ctx) => h(RenderPeritext, {children, ctx}),
};
