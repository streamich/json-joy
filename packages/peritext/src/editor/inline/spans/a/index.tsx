import * as React from 'react';
import {type JsonNodeView, s, type SchemaToJsonNode} from 'json-joy/lib/json-crdt';
import {
  SliceStacking,
  SliceTypeCon,
  type PeritextMlElement,
  type FromHtmlBehavior,
  type InlineAttrStack,
} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../../SpanBehavior';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {View} from './components/View';
import {Edit} from './components/Edit';
import {getDomain} from '../../../util/url';
import {Favicon} from '../../../components/Favicon';
import {Span} from './components/Span';
import type {IconProps, ValidationResult} from '../../SpanBehavior';
import type {Fmt} from '../../../state/formattings';
import type {RenderInlineProps} from '../../RenderInline';
import type {MenuItem} from '../../../types';
import type {DynamicCommandDefinition} from '../../../state/commands/types';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/lucide/link';

export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;

export const schema = s.obj(
  {
    href: s.str<string>(''),
  },
  {
    title: s.str<string>(''),
  },
);

export type Data = JsonNodeView<SchemaToJsonNode<typeof schema>>;

const fromHtml: FromHtmlBehavior<SliceStacking.Many, SliceTypeCon.a, typeof schema> = {
  a: (jsonml) => {
    const attr = jsonml[1] || {};
    const data: Data = {
      href: attr.href ?? '',
      title: attr.title ?? '',
    };
    return [SliceTypeCon.a, {data, inline: true}] as PeritextMlElement<SliceTypeCon.a, Data, true>;
  },
};

const name = 'Link';
const menu: MenuItem = {
  name,
  icon: () => <Icon width={15} height={15} />,
  right: () => <Sidetip small>⌘ K</Sidetip>,
  keys: ['⌘', 'k'],
};

/** Inline URL, like `<a>` tag in HTML. */
export const behavior = new (class ABehavior extends SpanBehavior<SliceStacking.Many, SliceTypeCon.a, typeof schema> {
  constructor() {
    super(SliceStacking.Many, SliceTypeCon.a, 'Link', schema, false, void 0, fromHtml);
  }

  public readonly cmd: DynamicCommandDefinition = (state: EditorState) => {
    const menu = this.getMenu(state);
    return {
      ...menu,
      onSelect: void 0,
      name,
      cmd: name,
      mono: true,
      compact: true,
      domain: 'range',
      group: ['Add formatting'],
      params: [
        {
          kind: 'str',
          id: 'url',
          name: 'Link',
          placeholder: 'https://example.com',
        },
        {
          kind: 'str',
          id: 'title',
          name: 'Title',
          optional: true,
          placeholder: 'Title',
        },
      ],
      action: (state, args) => {
        const url = args[0] || '';
        const data: Data = {href: url};
        const title = args[1] || '';
        if (title) data.title = title;
        state.surface.events.et.format('tog', SliceTypeCon.a, 'many', data);
      },
    };
  };

  public readonly menu = menu;

  public readonly validate = (formatting: Fmt<any, any>): ValidationResult => {
    const obj = formatting.conf()?.view() as Data;
    if (!obj || typeof obj !== 'object') return [{code: 'INVALID_CONFIG'}];
    const href = obj.href || '';
    if (typeof href !== 'string') return [{code: 'INVALID_URL'}];
    if (href.length < 4) return 'empty';
    const domain = getDomain(href);
    return domain ? 'good' : 'fine';
  };

  public readonly previewText = (formatting: Fmt<any, any>): string => {
    const data = formatting.conf()?.view() as Data;
    if (!data || typeof data !== 'object') return '';
    return (data.href || '').replace(/^(https?:\/\/)?(www\.)?/, '');
  };

  public readonly renderIcon = ({formatting}: IconProps) => {
    const data = formatting.conf()?.view() as Data;
    if (!data || typeof data !== 'object') return;
    const {href} = data;
    return href ? <Favicon url={data.href ?? ''} /> : null;
  };

  public readonly render = (children: React.ReactNode, attr: InlineAttrStack, props: RenderInlineProps) => {
    return <Span attr={attr}>{children}</Span>;
  };
  public readonly Edit = Edit;
  public readonly View = View;
})();
