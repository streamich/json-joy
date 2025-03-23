import {SliceBehavior, SliceTypeCon} from '../slice/constants';
import {CommonSliceType} from '../slice';
import type {PeritextMlElement} from '../block/types';
import type {NodeBuilder} from '../../../json-crdt-patch';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';
import type {FromHtmlConverter, ToHtmlConverter} from './types';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';

export type TagType = SliceTypeCon | number | string;

export class SliceRegistryEntry<
  Behavior extends SliceBehavior = SliceBehavior,
  Tag extends TagType = TagType,
  Schema extends NodeBuilder = NodeBuilder,
> {

  public isInline(): boolean {
    return this.behavior !== SliceBehavior.Marker;
  }
  
  constructor(
    public readonly behavior: Behavior,

    /**
     * The tag name of this slice. The tag is one step in the type path of the
     * slice. For example, below is a type path composed of three steps:
     * 
     * ```js
     * ['ul', 'li', 'p']
     * ```
     * 
     * Tag types are normally numbers of type {@link SliceTypeCon}, however,
     * they can also be any arbitrary strings or numbers.
     */
    public readonly tag: Tag,

    /**
     * Default expected schema of the slice data.
     */
    public readonly schema: Schema,

    /**
     * This property is relevant only for block split markers. It specifies
     * whether the block split marker is a container for other block elements.
     *
     * For example, a `blockquote` is a container for `paragraph` elements,
     * however, a `paragraph` is not a container (it can only contain inline
     * elements).
     * 
     * If the marker slice is of the container sort, they tag can appear in the
     * path steps of the type:
     * 
     * ```
     * 
     * ```
     */
    public readonly container: boolean = false,
    
    /**
     * Converts a node of this type to HTML representation: returns the HTML tag
     * and attributes. The method receives {@link PeritextMlElement} as an
     * argument, which is a tuple of internal HTML-like representation of the
     * node.
     */
    public readonly toHtml: ToHtmlConverter<PeritextMlElement<Tag, JsonNodeView<SchemaToJsonNode<Schema>>, Behavior extends SliceBehavior.Marker ? false : true>> | undefined = void 0,

    /**
     * Specifies a mapping of converters from HTML {@link JsonMlElement} to
     * {@link PeritextMlElement}. This way a slice type can specify multiple
     * HTML tags that are converted to the same slice type.
     * 
     * For example, both, `<b>` and `<strong>` tags can be converted to the
     * {@link SliceTypeCon.b} slice type.
     */
    public readonly fromHtml?: {
      [htmlTag: string]: FromHtmlConverter<PeritextMlElement<Tag, JsonNodeView<SchemaToJsonNode<Schema>>, Behavior extends SliceBehavior.Marker ? false : true>>;
    },
  ) {}
}

/**
 * @todo Consider moving the registry under the `/transfer` directory. Or maybe
 * `/slices` directory.
 */
export class SliceRegistry {
  private map: Map<TagType, SliceRegistryEntry> = new Map();
  private _fromHtml: Map<string, [entry: SliceRegistryEntry, converter: FromHtmlConverter][]> =
    new Map();

  public add(entry: SliceRegistryEntry<any, any, any>): void {
    const {tag, fromHtml} = entry;
    const _fromHtml = this._fromHtml;
    if (fromHtml) {
      for (const htmlTag in fromHtml) {
        const converter = fromHtml[htmlTag];
        const converters = _fromHtml.get(htmlTag) ?? [];
        converters.push([entry, converter]);
        _fromHtml.set(htmlTag, converters);
      }
    }
    const tagStr = CommonSliceType[tag as SliceTypeCon];
    if (tagStr && typeof tagStr === 'string')
      _fromHtml.set(tagStr, [[entry, () => [tag, null]]]);
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
            attr.behavior = !attr.inline ? SliceBehavior.Marker : (entry.behavior ?? SliceBehavior.Many);
          }
          return result;
        }
      }
    }
    return;
  }
}
