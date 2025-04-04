import * as React from 'react';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';
import {RenderInline} from './RenderInline';
import {RenderPeritext} from './RenderPeritext';
import type {PeritextPlugin} from '../../web/react/types';

const h = React.createElement;

/**
 * Plugin which renders the main cursor and all other current user local
 * cursors.
 */
export class CursorPlugin implements PeritextPlugin {
  public readonly caret: PeritextPlugin['caret'] = (props, children) => h(RenderCaret, <any>props, children);
  public readonly focus: PeritextPlugin['focus'] = (props, children) => h(RenderFocus, <any>props, children);
  public readonly anchor: PeritextPlugin['anchor'] = (props, children) => h(RenderAnchor, <any>props, children);
  public readonly inline: PeritextPlugin['inline'] = (props, children) => h(RenderInline, props as any, children);
  public readonly peritext: PeritextPlugin['peritext'] = (children, ctx) => h(RenderPeritext, {children, ctx});
}
