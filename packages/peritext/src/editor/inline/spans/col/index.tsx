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
import {View} from './components/View';
import {Edit} from './components/Edit';
import {isValid} from '../../../util/color';
import type {IconProps, ValidationResult} from '../../SpanBehavior';
import type {Fmt} from '../../../state/formattings';
import type {EditorState} from '../../../state';
import type {DynamicCommandDefinition} from '../../../state/commands/types';
import Icon__svg from 'iconista/lib/react/lucide/paintbrush';

export const name = 'Color';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;

export const schema = s.obj({
  col: s.str<string>(''),
});

export type Data = JsonNodeView<SchemaToJsonNode<typeof schema>>;

const fromHtml: FromHtmlBehavior<SliceStacking.Many, SliceTypeCon.col, typeof schema> = {
  col: (jsonml) => {
    const attr = jsonml[1] || {};
    const data: Data = {
      col: attr.col ?? '',
    };
    return [SliceTypeCon.col, {data, inline: true}] as PeritextMlElement<SliceTypeCon.col, any, true>;
  },
};

export const behavior = new (class ColBehavior extends SpanBehavior<
  SliceStacking.Many,
  SliceTypeCon.col,
  typeof schema
> {
  constructor() {
    super(SliceStacking.Many, SliceTypeCon.col, name, schema, false, void 0, fromHtml);
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
        state.surface.events.et.format('tog', SliceTypeCon.col, 'many', {col: color});
      },
    };
  };

  public readonly menuId = 'fmt-artistic';
  public readonly menu = (state: EditorState) => ({
    name,
    order: 1,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.selection.showNewSlicePopup(SliceTypeCon.col);
    },
  });

  public readonly validate = (formatting: Fmt<any, any>): ValidationResult => {
    const obj = formatting.conf()?.view() as Data;
    if (!obj || typeof obj !== 'object') return [{code: 'INVALID_CONFIG'}];
    const color = obj.col || '';
    if (typeof color !== 'string' || !isValid(color)) return [{code: 'INVALID_COLOR'}];
    if (color.length < 4) return 'empty';
    return 'good';
  };

  public readonly previewText = (formatting: Fmt<any, any>): string => {
    const data = formatting.conf()?.view() as Data;
    if (!data || typeof data !== 'object') return '';
    let color = data.col || '';
    if (color[0] === '#' && color.length === 9) color = color.slice(0, 7) + '.' + color.slice(-2);
    return color;
  };

  public readonly renderIcon = ({formatting}: IconProps) => {
    const color = String(formatting.conf()?.read('/col') || void 0);
    return <span style={{backgroundColor: color, display: 'inline-block', width: 16, height: 16, borderRadius: 3}} />;
  };

  public readonly text = (style: React.CSSProperties, attr: InlineAttrStack) => {
    const data = attr[attr.length - 1].slice.data();
    const color: string | undefined = typeof data === 'object' && data ? String((data as any).col) : void 0;
    if (color) style.color = color;
  };

  public readonly Edit = Edit;
  public readonly View = View;
})();
