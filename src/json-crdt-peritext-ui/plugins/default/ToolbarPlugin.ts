import * as React from 'react';
import {RenderInline} from './RenderInline';
import {RenderPeritext} from './RenderPeritext';
import {text} from '../minimal/text';
import {RenderBlock} from './RenderBlock';
import type {PeritextPlugin} from '../../react/types';

const h = React.createElement;

export class ToolbarPlugin implements PeritextPlugin {
  public readonly text: PeritextPlugin['text'] = text;
  
  public readonly inline: PeritextPlugin['inline'] = (props, children) => h(RenderInline, props as any, children);

  public readonly block: PeritextPlugin['block'] = (props, children) => h(RenderBlock, props as any, children);

  public readonly peritext: PeritextPlugin['peritext'] = (props, children, ctx) => h(RenderPeritext, {...props, children, ctx});
};
