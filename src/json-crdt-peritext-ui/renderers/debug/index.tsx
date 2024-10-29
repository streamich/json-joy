import * as React from 'react';
import {RendererMap} from "../../react/types";
import {RenderInline} from './RenderInline';
import {RenderBlock} from './RenderBlock';
import {RenderPeritext, RenderPeritextProps} from './RenderPeritext';

export const renderers = (options?: Pick<RenderPeritextProps, 'enabled'>): RendererMap => ({
  inline: (props, children, attributes) => <RenderInline {...props} children={children} attributes={attributes} />,
  block: (props, children) => <RenderBlock {...props} children={children} />,
  peritext: (props, children) => <RenderPeritext {...options} {...props} children={children} />
});
