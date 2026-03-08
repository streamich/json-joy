import * as React from 'react';
import {type JsonNodeView, s, type SchemaToJsonNode} from 'json-joy/lib/json-crdt';
import {
  SliceStacking,
  SliceTypeCon,
  type FromHtmlBehavior,
  type PeritextMlElement,
} from 'json-joy/lib/json-crdt-extensions';
import {InlineSliceBehavior} from '../../InlineSliceBehavior';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {View} from './components/View';
import {Edit} from './components/Edit';
import {isValid} from '../../../util/color';
import type {IconProps, ValidationResult} from '../../InlineSliceBehavior';
import type {ToolbarFormatting} from '../../../state/formattings';

export const Icon = makeIcon({set: 'lucide', icon: 'paint-bucket'});

export const schema = s.obj({
  col: s.str<string>(''),
});

export type Data = JsonNodeView<SchemaToJsonNode<typeof schema>>;

const fromHtml: FromHtmlBehavior<SliceStacking.Many, SliceTypeCon.bg, typeof schema> = {
  bg: (jsonml) => {
    const attr = jsonml[1] || {};
    const data: Data = {
      col: attr.col ?? '',
    };
    return [SliceTypeCon.bg, {data, inline: true}] as PeritextMlElement<SliceTypeCon.bg, any, true>;
  },
};

export const behavior = new (class BgBehavior extends InlineSliceBehavior<
  SliceStacking.Many,
  SliceTypeCon.bg,
  typeof schema
> {
  constructor() {
    super(SliceStacking.Many, SliceTypeCon.bg, 'Background', schema, false, void 0, fromHtml);
  }

  public readonly menu = {
    name: 'Background',
    icon: () => <Icon width={16} height={16} />,
  };

  // TODO: Reuse all these...

  public readonly validate = (formatting: ToolbarFormatting<any, any>): ValidationResult => {
    const obj = formatting.conf()?.view() as Data;
    if (!obj || typeof obj !== 'object') return [{code: 'INVALID_CONFIG'}];
    const color = obj.col || '';
    if (typeof color !== 'string' || !isValid(color)) return [{code: 'INVALID_COLOR'}];
    if (color.length < 4) return 'empty';
    return 'good';
  };

  public readonly previewText = (formatting: ToolbarFormatting<any, any>): string => {
    const data = formatting.conf()?.view() as Data;
    if (!data || typeof data !== 'object') return '';
    return data.col || '';
  };

  public readonly renderIcon = ({formatting}: IconProps) => {
    const color = String(formatting.conf()?.read('/col') || void 0);
    return <span style={{backgroundColor: color, display: 'inline-block', width: 16, height: 16, borderRadius: 3}} />;
  };

  public readonly Edit = Edit;
  public readonly View = View;
})();
