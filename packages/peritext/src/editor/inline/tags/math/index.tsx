import * as React from 'react';
import {type JsonNodeView, s, type SchemaToJsonNode} from 'json-joy/lib/json-crdt';
import {
  SliceStacking,
  SliceTypeCon,
  type FromHtmlBehavior,
  type PeritextMlElement,
} from 'json-joy/lib/json-crdt-extensions';
import {convertLatexToMarkup} from 'mathlive';
import {InlineSliceBehavior} from '../../InlineSliceBehavior';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {View} from './components/View';
import {Edit} from './components/Edit';
import type {IconProps, ValidationResult} from '../../InlineSliceBehavior';
import type {ToolbarFormatting} from '../../../state/formattings';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

export const Icon = makeIcon({set: 'tabler', icon: 'math-integral-x'});

/**
 * Minimal schema — no required data fields. The formula lives in the marked
 * document text. Optional `size` field for future display-size hints.
 */
export const schema = s.obj(
  {},
  {
    // TODO: rename to "sz"
    size: s.str<'d' | 'T' | 'S' | 'SS'>('d'),
  },
);

export type Data = JsonNodeView<SchemaToJsonNode<typeof schema>>;

const fromHtml: FromHtmlBehavior<SliceStacking.One, SliceTypeCon.math, typeof schema> = {
  math: (jsonml) => {
    return [SliceTypeCon.math, {inline: true}] as PeritextMlElement<SliceTypeCon.math, Data, true>;
  },
};

/** Inline math mark. The marked text content is the LaTeX formula source. */
export const behavior = new (class MathBehavior extends InlineSliceBehavior<
  SliceStacking.One,
  SliceTypeCon.math,
  typeof schema
> {
  constructor() {
    super(SliceStacking.One, SliceTypeCon.math, 'Math', schema, false, void 0, fromHtml);
  }

  public readonly menu = {
    name: 'Math',
    icon: () => <Icon width={16} height={16} />,
  };

  public readonly validate = (formatting: ToolbarFormatting<any, any>): ValidationResult => {
    const tex = (formatting.range as unknown as Slice<string>).text?.() ?? '';
    if (!tex || typeof tex !== 'string') return 'empty';
    return 'good';
  };

  public readonly previewText = (formatting: ToolbarFormatting<any, any>): string => {
    const tex = (formatting.range as unknown as Slice<string>).text?.() ?? '';
    return tex.length > 32 ? tex.slice(0, 32) + '…' : tex;
  };

  public readonly renderIcon = ({formatting}: IconProps) => {
    const tex = (formatting.range as unknown as Slice<string>).text?.() ?? '';
    if (!tex) return <Icon width={16} height={16} />;
    try {
      const html = convertLatexToMarkup(tex);
      return (
        <span
          style={{fontSize: '10px', lineHeight: 1, display: 'inline-flex', alignItems: 'center'}}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: mathlive produces safe sanitized HTML
          dangerouslySetInnerHTML={{__html: html}}
        />
      );
    } catch {
      return <Icon width={16} height={16} />;
    }
  };

  public readonly View = View;
  public readonly Edit = Edit;
})();
