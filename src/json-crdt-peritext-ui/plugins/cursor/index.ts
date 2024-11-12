import * as React from 'react';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';
import {RenderInline} from './RenderInline';
import {RenderPeritext} from './RenderPeritext';
import type {PeritextPlugin} from '../../react/types';

const h = React.createElement;

/**
 * Plugin which renders the main cursor and all other current user local
 * cursors.
 */
export const cursorPlugin: PeritextPlugin = {
  caret: (props, children) => h(RenderCaret, <any>props, children),
  focus: (props, children) => h(RenderFocus, <any>props, children),
  anchor: (props, children) => h(RenderAnchor, <any>props, children),
  inline: (props, children) => h(RenderInline, props as any, children),
  peritext: (props, children, ctx) => h(RenderPeritext, {...props, children, ctx}),
};
