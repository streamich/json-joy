import * as React from 'react';
import {RenderInline} from './RenderInline';
import {RenderPeritext} from './RenderPeritext';
import {text} from '../minimal/text';
import {RenderBlock} from './RenderBlock';
import type {PeritextPlugin} from '../../react/types';

const h = React.createElement;

export const renderers: PeritextPlugin = {
  text,
  inline: (props, children) => h(RenderInline, props as any, children),
  block: (props, children) => h(RenderBlock, props as any, children),
  peritext: (props, children, ctx) => h(RenderPeritext, {...props, children, ctx}),
};
