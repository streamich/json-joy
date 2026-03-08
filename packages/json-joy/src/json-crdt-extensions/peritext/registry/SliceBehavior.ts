import {SliceStacking} from '../slice/constants';
import {formatStep} from '../slice/util';
import type {PeritextMlElement} from '../block/types';
import type {NodeBuilder} from '../../../json-crdt-patch';
import type {FromHtmlConverter, ToHtmlConverter} from './types';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import type {Printable} from 'tree-dump';
import type {TypeTag} from '../slice';

export type ToHtmlBehavior<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> = ToHtmlConverter<
  PeritextMlElement<Tag, JsonNodeView<SchemaToJsonNode<Schema>>, Stacking extends SliceStacking.Marker ? false : true>
>;

export type FromHtmlBehavior<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> = {
  [htmlTag: string]: FromHtmlConverter<
    PeritextMlElement<Tag, JsonNodeView<SchemaToJsonNode<Schema>>, Stacking extends SliceStacking.Marker ? false : true>
  >;
};

export class SliceBehavior<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> implements Printable
{
  public isInline(): boolean {
    return this.stacking !== SliceStacking.Marker;
  }

  constructor(
    /**
     * Specifies whether the slice is an inline or block element. And if it is
     * an inline element, whether multiple instances of the same tag are allowed
     * to be applied to a range of tex - "Many", or only one instance - "One".
     */
    public readonly stacking: Stacking,

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
     * User friendly display name. Also used for translation purposes.
     */
    public readonly name: string,

    /**
     * Default expected schema of the slice stored data.
     */
    public readonly schema: Schema | undefined = void 0,

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
    public readonly toHtml: ToHtmlBehavior<Stacking, Tag, Schema> | undefined = void 0,

    /**
     * Specifies a mapping of converters from HTML {@link JsonMlElement} to
     * {@link PeritextMlElement}. This way a slice type can specify multiple
     * HTML tags that are converted to the same slice type.
     *
     * For example, both, `<b>` and `<strong>` tags can be converted to the
     * {@link SliceTypeCon.b} slice type.
     */
    public readonly fromHtml: FromHtmlBehavior<Stacking, Tag, Schema> | undefined = void 0,
  ) {}

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab: string = ''): string {
    return `${formatStep(this.tag)} (${this.stacking})`;
  }
}
