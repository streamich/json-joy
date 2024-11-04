import * as React from 'react';
import {RenderInline} from './RenderInline';
import {RenderBlock} from './RenderBlock';
import {RenderPeritext, type RenderPeritextProps} from './RenderPeritext';
import type {RendererMap} from '../../react/types';

export const renderers = (options?: Pick<RenderPeritextProps, 'enabled'>): RendererMap => ({
  inline: (props, children) => <RenderInline {...props}>{children}</RenderInline>,
  block: (props, children) => <RenderBlock {...props}>{children}</RenderBlock>,
  peritext: (props, children, ctx) => (
    <RenderPeritext {...options} {...props} ctx={ctx}>
      {children}
    </RenderPeritext>
  ),
});
