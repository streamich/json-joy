import {s} from '../../../json-crdt-patch';
import {SliceStacking, SliceTypeCon as TAG} from '../slice/constants';
import {CommonSliceType, type TypeTag} from '../slice';
import {SliceBehavior} from './SliceBehavior';
import {printTree} from 'tree-dump/lib/printTree';
import type {PeritextMlElement} from '../block/types';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';
import type {FromHtmlConverter, ToHtmlConverter} from './types';
import type {Printable} from 'tree-dump';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';

/**
 * Slice registry contains a record of possible inline an block formatting
 * annotations. Each entry in the registry is a {@link SliceBehavior} that
 * specifies the behavior, tag, and other properties of the slice.
 *
 * @todo Consider moving the registry under the `/transfer` directory. Or maybe
 * `/slices` directory.
 */
export class SliceRegistry implements Printable {
  /**
   * Creates a new slice registry with common tag registered.
   */
  public static readonly withCommon = (): SliceRegistry => {
    const undefSchema = s.con(undefined);
    const registry = new SliceRegistry();
    //------------------------------ Inline elements with "One" stacking behavior
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
  
    // --------------------------- Inline elements with "Many" stacking behavior
    const aSchema = s.obj({}, {
      href: s.str<string>(''),
      title: s.str<string>(''),
    });
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
  

  private map: Map<TypeTag, SliceBehavior> = new Map();
  private _fromHtml: Map<string, [entry: SliceBehavior, converter: FromHtmlConverter][]> = new Map();

  public clear(): void {
    this.map.clear();
    this._fromHtml.clear();
  }

  public add(entry: SliceBehavior<any, any, any>): void {
    const {tag, fromHtml} = entry;
    this.map.set(tag, entry);
    const _fromHtml = this._fromHtml;
    if (fromHtml) {
      for (const htmlTag in fromHtml) {
        const converter = fromHtml[htmlTag];
        const converters = _fromHtml.get(htmlTag) ?? [];
        converters.push([entry, converter]);
        _fromHtml.set(htmlTag, converters);
      }
    }
    const tagStr = CommonSliceType[tag as TAG];
    if (tagStr && typeof tagStr === 'string' && (!fromHtml || !(tagStr in fromHtml)))
      _fromHtml.set(tagStr, [[entry, () => [tag, null]]]);
  }

  public get(tag: TypeTag): SliceBehavior | undefined {
    return this.map.get(tag);
  }

  public isContainer(tag: TypeTag): boolean {
    const entry = this.map.get(tag);
    return entry?.container ?? false;
  }

  public toHtml(el: PeritextMlElement): ReturnType<ToHtmlConverter<any>> | undefined {
    const entry = this.map.get(el[0]);
    return entry?.toHtml ? entry?.toHtml(el) : void 0;
  }

  public fromHtml(el: JsonMlElement): PeritextMlElement | undefined {
    const tag = el[0] + '';
    const converters = this._fromHtml.get(tag);
    if (converters) {
      for (const [entry, converter] of converters) {
        const result = converter(el);
        if (result) {
          if (entry.isInline()) {
            const attr = result[1] ?? (result[1] = {});
            attr.inline = entry.isInline();
            attr.stacking = !attr.inline ? SliceStacking.Marker : (entry.stacking ?? SliceStacking.Many);
          }
          return result;
        }
      }
    }
    return;
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab: string = ''): string {
    return `SliceRegistry` + printTree(tab, [...this.map.values()].map((entry) => tab => entry.toString(tab)));
  }
}
