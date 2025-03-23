import {SliceBehavior, SliceTypeCon} from '../slice/constants';
import {CommonSliceType} from '../slice';
import type {PeritextMlElement} from '../block/types';
import type {NodeBuilder} from '../../../json-crdt-patch';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';
import type {FromHtmlConverter, SliceTypeDefinition, ToHtmlConverter} from './types';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';

export class SliceRegistryEntry<
  Behavior extends SliceBehavior = SliceBehavior,
  Tag extends SliceTypeCon | number | string = SliceTypeCon | number | string,
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
  private map: Map<string | number, SliceTypeDefinition<any, any, any>> = new Map();
  private toHtmlMap: Map<string | number, ToHtmlConverter<any>> = new Map();
  private fromHtmlMap: Map<string, [def: SliceTypeDefinition<any, any, any>, converter: FromHtmlConverter][]> =
    new Map();

  public add<Type extends number | string, Schema extends NodeBuilder, Inline extends boolean = true>(
    def: SliceTypeDefinition<Type, Schema, Inline>,
  ): void {
    const {type, toHtml, fromHtml} = def;
    const fromHtmlMap = this.fromHtmlMap;
    if (toHtml) this.toHtmlMap.set(type, toHtml);
    if (fromHtml) {
      for (const htmlTag in fromHtml) {
        const converter = fromHtml[htmlTag];
        const converters = fromHtmlMap.get(htmlTag) ?? [];
        converters.push([def, converter]);
        fromHtmlMap.set(htmlTag, converters);
      }
    }
    const tag = CommonSliceType[type as any];
    if (tag && typeof tag === 'string') {
      fromHtmlMap.set(tag, [[def, () => [type, null]]]);
    }
  }

  public def<Type extends number | string, Schema extends NodeBuilder, Inline extends boolean = true>(
    type: Type,
    schema: Schema,
    behavior: SliceBehavior,
    inline: boolean,
    rest: Omit<SliceTypeDefinition<Type, Schema, Inline>, 'type' | 'schema' | 'behavior' | 'inline'> = {},
  ): void {
    this.add({type, schema, behavior, inline, ...rest});
  }

  public toHtml(el: PeritextMlElement): ReturnType<ToHtmlConverter<any>> | undefined {
    const converter = this.toHtmlMap.get(el[0]);
    return converter ? converter(el) : undefined;
  }

  public fromHtml(el: JsonMlElement): PeritextMlElement | undefined {
    const tag = el[0] + '';
    const converters = this.fromHtmlMap.get(tag);
    if (converters) {
      for (const [def, converter] of converters) {
        const result = converter(el);
        if (result) {
          const attr = result[1] ?? (result[1] = {});
          attr.inline = def.inline ?? def.type < 0;
          attr.behavior = !attr.inline ? SliceBehavior.Marker : (def.behavior ?? SliceBehavior.Many);
          return result;
        }
      }
    }
    return;
  }
}
