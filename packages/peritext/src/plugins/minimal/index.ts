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
  caret: (props, children) => h(RenderCaret, props as any, children),
  focus: (props, children) => h(RenderFocus, props as any, children),
  anchor: (props) => h(RenderAnchor, props as any),
  inline: (props, children) => h(RenderInline, props as any, children),
  block: (props, children) => h(RenderBlock, props as any, children),
  peritext: (children, ctx) => h(RenderPeritext, {children, ctx}),
};
