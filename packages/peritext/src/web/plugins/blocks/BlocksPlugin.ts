import * as React from 'react';
import {RenderBlock} from './RenderBlock';
import type {PeritextPlugin} from '../../react/types';

const h = React.createElement;

export class BlocksPlugin implements PeritextPlugin {
  public readonly block: PeritextPlugin['block'] = (props, children) => h(RenderBlock, props as any, children);
}
