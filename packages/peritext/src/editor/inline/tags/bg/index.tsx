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
import {behavior as col} from '../col';

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

  public readonly validate = col.validate;
  public readonly previewText = col.previewText;
  public readonly renderIcon = col.renderIcon;
  public readonly Edit = col.Edit;
  public readonly View = col.View;
})();
