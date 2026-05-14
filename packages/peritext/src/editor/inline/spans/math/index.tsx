import * as React from 'react';
import {type JsonNodeView, s, type SchemaToJsonNode} from 'json-joy/lib/json-crdt';
import {
  SliceStacking,
  SliceTypeCon,
  type FromHtmlBehavior,
  type PeritextMlElement,
} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../../SpanBehavior';
import {View} from './components/View';
import {Edit} from './components/Edit';
import {Span} from './components/Span';
import type {ValidationResult} from '../../SpanBehavior';
import type {Fmt} from '../../../state/formattings';
import type {InlineAttrStack, Slice} from 'json-joy/lib/json-crdt-extensions';
import type {RenderInlineProps} from '../../RenderInline';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/tabler/math-integral-x';

export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;

export const schema = s.obj(
  {},
  {
    sz: s.str<'d' | 'T' | 'S' | 'SS'>('d'),
  },
);

export type Data = JsonNodeView<SchemaToJsonNode<typeof schema>>;

const fromHtml: FromHtmlBehavior<SliceStacking.Atomic, SliceTypeCon.math, typeof schema> = {
  math: (jsonml) => {
    return [SliceTypeCon.math, {inline: true}] as PeritextMlElement<SliceTypeCon.math, Data, true>;
  },
};

/** Inline math mark. The marked text content is the LaTeX formula source. */
export const behavior = new (class MathBehavior extends SpanBehavior<
  SliceStacking.Atomic,
  SliceTypeCon.math,
  typeof schema
> {
  constructor() {
    super(SliceStacking.Atomic, SliceTypeCon.math, 'Math', schema, false, void 0, fromHtml);
  }

  public readonly menuId = 'fmt-technical';
  public readonly menu = (state: EditorState) => ({
    name: 'Math',
    order: 2,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.et.format({
        action: 'tog',
        type: SliceTypeCon.math,
        stack: 'atomic',
        padded: true,
      });
    },
  });

  public readonly validate = (formatting: Fmt<any, any>): ValidationResult => {
    const tex = (formatting.range as unknown as Slice<string>).text?.() ?? '';
    if (!tex || typeof tex !== 'string') return 'empty';
    return 'good';
  };

  public readonly previewText = (formatting: Fmt<any, any>): string => {
    const tex = (formatting.range as unknown as Slice<string>).text?.() ?? '';
    return tex.length > 32 ? tex.slice(0, 32) + '…' : tex;
  };

  public readonly render = (children: React.ReactNode, attr: InlineAttrStack, props: RenderInlineProps) => (
    <Span inline={props.inline} attr={attr[attr.length - 1]}>
      {children}
    </Span>
  );

  public readonly View = View;
  public readonly Edit = Edit;
})();
