import * as React from 'react';
import {type JsonNodeView, s, type SchemaToJsonNode} from 'json-joy/lib/json-crdt';
import {
  type InlineAttrStack,
  SliceStacking,
  SliceTypeCon,
  type FromHtmlBehavior,
  type PeritextMlElement,
} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../../SpanBehavior';
import {behavior as col} from '../col';
import type {EditorState} from '../../../state/EditorState';
import type {DynamicCommandDefinition} from '../../../state/commands/types';
import Icon__svg from 'iconista/lib/react/lucide/paint-bucket';

export const name = 'Background';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;

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

const menu = (state: EditorState) => ({
  name,
  order: 2,
  icon: () => <Icon width={16} height={16} />,
});

export const behavior = new (class BgBehavior extends SpanBehavior<SliceStacking.Many, SliceTypeCon.bg, typeof schema> {
  constructor() {
    super(SliceStacking.Many, SliceTypeCon.bg, name, schema, false, void 0, fromHtml);
  }

  public readonly cmd: DynamicCommandDefinition = (state: EditorState) => {
    const menu = this.getMenu(state);
    return {
      ...menu,
      onSelect: void 0,
      name,
      cmd: name,
      mono: true,
      domain: 'range',
      group: ['Add formatting'],
      params: [
        {
          id: 'col',
          name: 'Color',
          kind: 'color',
          required: true,
          default: '#000000',
          placeholder: '#hex',
        },
      ],
      action: (state, args) => {
        const color = args[0] || '#000000';
        state.surface.events.et.format('tog', SliceTypeCon.bg, 'many', {col: color});
      },
    };
  };

  public readonly action = (state: EditorState) => {
    state.selection.showNewSlicePopup(SliceTypeCon.bg);
  };

  public readonly menuId = 'fmt-artistic';
  public readonly menu = menu;
  // public readonly cmd: DynamicCommandDefinition = (state: EditorState) => ({
  //   ...menu(state),
  //   name: 'Open background color picker',
  //   cmd: 'OpenBgPicker',
  //   action: this.action,
  // });

  public readonly text = (style: React.CSSProperties, attr: InlineAttrStack) => {
    const data = attr[attr.length - 1].slice.data();
    const color: string | undefined = typeof data === 'object' && data ? String((data as any).col) : void 0;
    if (color) style.backgroundColor = color;
  };

  public readonly validate = col.validate;
  public readonly previewText = col.previewText;
  public readonly renderIcon = col.renderIcon;
  public readonly Edit = col.Edit;
  public readonly View = col.View;
})();
