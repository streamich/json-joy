import {RenderInline} from './RenderInline';
import {RenderBlock} from './RenderBlock';
import {RenderCaret} from './RenderCaret';
import {RenderPeritext, type RenderPeritextProps} from './RenderPeritext';
import type {PeritextPlugin} from '../../web/react/types';

export interface DebugPluginOpts extends Pick<RenderPeritextProps, 'state'> {}

export class DebugPlugin implements PeritextPlugin {
  constructor(protected readonly opts: DebugPluginOpts = {}) {}

  public readonly inline: PeritextPlugin['inline'] = (props, children) => (
    <RenderInline {...props}>{children}</RenderInline>
  );

  public readonly block: PeritextPlugin['block'] = (props, children) => (
    <RenderBlock {...props}>{children}</RenderBlock>
  );

  public readonly peritext: PeritextPlugin['peritext'] = (children, ctx) => (
    <RenderPeritext {...this.opts} {...{children, ctx}} />
  );

  public readonly caret: PeritextPlugin['caret'] = (props, children) => (
    <RenderCaret {...props}>{children}</RenderCaret>
  );
}
