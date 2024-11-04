import * as React from 'react';
import type {RendererMap} from '../../react/types';
import {RenderInline} from './RenderInline';
import {RenderBlock} from './RenderBlock';
import {RenderPeritext, type RenderPeritextProps} from './RenderPeritext';

export const renderers = (options?: Pick<RenderPeritextProps, 'enabled'>): RendererMap => ({
  inline: (props) => <RenderInline {...props} />,
  block: (props, children) => <RenderBlock {...props}>{children}</RenderBlock>,
  peritext: (props, children, ctx) => (
    <RenderPeritext {...options} {...props} ctx={ctx}>
      {children}
    </RenderPeritext>
  ),
});
