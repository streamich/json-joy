import * as React from 'react';
import {RenderInline} from './RenderInline';
import {RenderPeritext, type RenderPeritextProps} from './RenderPeritext';
import {text} from '../minimal/text';
import {RenderBlock} from './RenderBlock';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import type {PeritextPlugin} from '../../web/react/types';
import type {DebugState} from '../debug/state';

const h = React.createElement;

export interface ToolbarPluginOpts {
  debug?: DebugState;
}

export class ToolbarPlugin implements PeritextPlugin {
  constructor(public readonly opts: ToolbarPluginOpts = {}) {}

  public readonly text: PeritextPlugin['text'] = text;

  public readonly inline: PeritextPlugin['inline'] = (props, children) => h(RenderInline, props as any, children);

  public readonly block: PeritextPlugin['block'] = (props, children) => h(RenderBlock, props as any, children);

  public readonly peritext: PeritextPlugin['peritext'] = (children, surface) =>
    h(RenderPeritext, {children, surface, opts: this.opts} satisfies RenderPeritextProps);

  public readonly caret: PeritextPlugin['caret'] = (props, children) => h(RenderCaret, <any>props, children);
  public readonly focus: PeritextPlugin['focus'] = (props, children) => h(RenderFocus, <any>props, children);
}
