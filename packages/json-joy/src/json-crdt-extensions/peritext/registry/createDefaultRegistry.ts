import {s} from '../../../json-crdt-patch';
import {SliceStacking, SliceTypeCon as TAG} from '../slice/constants';
import {SliceBehavior} from './SliceBehavior';
import {SliceRegistry} from './SliceRegistry';
import type {TypeTag} from '../slice';
import type {PeritextMlElement} from '../block/types';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';

/**
 * Creates a new slice registry with common tag registered.
 */
export const createDefaultRegistry = (): SliceRegistry => {
  const undefSchema = s.con(undefined);
  const registry = new SliceRegistry();

  //----------------------------- Inline elements with "One" stacking behavior
  const i0 = <Tag extends TypeTag = TypeTag>(
    tag: Tag,
    name: string,
    fromHtml?: SliceBehavior<SliceStacking.One, Tag, typeof undefSchema>['fromHtml'],
  ): void => {
    registry.add(new SliceBehavior(SliceStacking.One, tag, name, void 0, false, void 0, fromHtml));
  };
  const i1 = <Tag extends TypeTag = TypeTag>(tag: Tag, name: string, htmlTags: string[]): void => {
    const fromHtml = {} as Record<any, any>;
    for (const htmlTag of htmlTags) fromHtml[htmlTag] = () => [tag, null];
    i0(tag, name, fromHtml);
  };
  i1(TAG.i, 'Italic', ['i', 'em']);
  i1(TAG.b, 'Bold', ['b', 'strong']);
  i1(TAG.s, 'Strikethrough', ['s', 'strike']);
  i0(TAG.u, 'Underline');
  i0(TAG.code, 'Code');
  i0(TAG.mark, 'Highlight');
  i0(TAG.kbd, 'Keyboard');
  i0(TAG.del, 'Delete');
  i0(TAG.ins, 'Insert');
  i0(TAG.sup, 'Superscript');
  i0(TAG.sub, 'Subscript');
  i0(TAG.math, 'Math');

  // -------------------------- Inline elements with "Atomic" stacking behavior
  const a0 = <Tag extends TypeTag = TypeTag>(tag: Tag, name: string): void => {
    registry.add(new SliceBehavior(SliceStacking.Atomic, tag, name));
  };
  a0(TAG.iembed, 'Inline Embed');

  // --------------------------- Inline elements with "Many" stacking behavior
  const aSchema = s.obj(
    {},
    {
      href: s.str<string>(''),
      title: s.str<string>(''),
    },
  );
  registry.add(
    new SliceBehavior(SliceStacking.Many, TAG.a, 'Link', aSchema, false, void 0, {
      a: (jsonml) => {
        const attr = jsonml[1] || {};
        const data: JsonNodeView<SchemaToJsonNode<typeof aSchema>> = {
          href: attr.href ?? '',
          title: attr.title ?? '',
        };
        return [TAG.a, {data, inline: true}] as PeritextMlElement<TAG.a, any, true>;
      },
    }),
  );

  // const colSchema = s.obj(
  //   {},
  //   {
  //     col: s.str<string>(''),
  //   },
  // );
  // registry.add(
  //   new SliceBehavior(SliceStacking.Many, TAG.col, 'Color', colSchema, false, void 0, {
  //     col: (jsonml) => {
  //       const attr = jsonml[1] || {};
  //       const data: JsonNodeView<SchemaToJsonNode<typeof colSchema>> = {
  //         col: attr.col ?? '',
  //       };
  //       return [TAG.col, {data, inline: true}] as PeritextMlElement<TAG.col, any, true>;
  //     },
  //   }),
  // );

  // TODO: add more default annotations with "Many" stacking behavior
  // comment = SliceTypeCon.comment,
  // font = SliceTypeCon.font,
  // col = SliceTypeCon.col,
  // bg = SliceTypeCon.bg,
  // hidden = SliceTypeCon.hidden,
  // footnote = SliceTypeCon.footnote,
  // ref = SliceTypeCon.ref,
  // iaside = SliceTypeCon.iaside,
  // iembed = SliceTypeCon.iembed,
  // bookmark = SliceTypeCon.bookmark,

  // -------------------------- Block elements with "Marker" stacking behavior
  const commonBlockSchema = s.obj(
    {},
    {
      indent: s.con(0),
      align: s.str<'left' | 'center' | 'right' | 'justify'>('left'),
    },
  );
  const b0 = <Tag extends TypeTag = TypeTag>(tag: Tag, name: string, container: boolean) => {
    registry.add(new SliceBehavior(SliceStacking.Marker, tag, name, commonBlockSchema, container));
  };
  b0(TAG.p, 'Paragraph', false);
  b0(TAG.blockquote, 'Blockquote', true);
  b0(TAG.codeblock, 'Code block', false);
  b0(TAG.pre, 'Pre-formatted', false);
  b0(TAG.ul, 'Unordered list', true);
  b0(TAG.ol, 'Ordered list', true);
  b0(TAG.tl, 'Task list', true);
  b0(TAG.li, 'List item', true);
  b0(TAG.h1, 'Heading 1', false);
  b0(TAG.h2, 'Heading 2', false);
  b0(TAG.h3, 'Heading 3', false);
  b0(TAG.h4, 'Heading 4', false);
  b0(TAG.h5, 'Heading 5', false);
  b0(TAG.h6, 'Heading 6', false);
  b0(TAG.title, 'Title', false);
  b0(TAG.subtitle, 'Subtitle', false);
  // b0(TAG.br, false);
  // b0(TAG.nl, false);
  // b0(TAG.hr, false);
  // b0(TAG.page, false);
  // b0(TAG.aside, true);
  // b0(TAG.embed, false);
  // b0(TAG.column, true);
  // b0(TAG.contents, true);
  // b0(TAG.table, true);
  // b0(TAG.row, true);
  // b0(TAG.cell, true);
  // b0(TAG.collapselist, true);
  // b0(TAG.collapse, true);
  // b0(TAG.note, true);
  // b0(TAG.mathblock, false);

  return registry;
};
