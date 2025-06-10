import type {Range} from '../rga/Range';
import type {Stateful} from '../types';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SliceStacking, SliceTypeCon} from './constants';
import type {NodeBuilder, nodes} from '../../../json-crdt-patch';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {Anchor} from '../rga/constants';

/**
 * Represents a developer-defined type of a slice, allows developers to assign
 * rich-text formatting or block types to slices.
 *
 * For example:
 *
 * ```ts
 * 'bold'
 * '<b>'
 * ['paragraph']
 * ```
 *
 * Slice types can specify block nesting:
 *
 * ```ts
 * ['blockquote', 'paragraph']
 * ['ul', 'li', 'code']
 * ```
 *
 * Slice types can use integers for performance:
 *
 * ```ts
 * 1
 * [2]
 * [3, 4]
 * ```
 *
 * Block split with discriminant, to differentiate between two adjacent blocks:
 *
 * ```ts
 * [['<blockquote>', 0], '<p>']
 * [['<blockquote>', 1], '<p>']
 * ```
 */
export type SliceType = TypeTag | SliceTypeSteps;
export type SliceTypeSteps = SliceTypeStep[];
export type SliceTypeStep = TypeTag | [tag: TypeTag, discriminant: number, data?: Record<string, unknown>];

/**
 * Tag is number or a string, the last type element if type is a list. Tag
 * specifies the kind of the leaf block element. For example, if the full type
 * is `['ul', 'li', 'p']`, then the tag is `<p>`.
 */
export type TypeTag = SliceTypeCon | number | string;

/**
 * The JSON CRDT schema of the stored slices in the document. The slices are
 * stored compactly in "vec" nodes, with the first *header* element storing
 * multiple values in a single integer.
 */
export type SliceSchema = nodes.vec<
  [
    /**
     * The header stores the stacking behavior {@link SliceStacking} of the
     * slice as well as anchor {@link Anchor} points of the x1 and x2 points.
     */
    header: nodes.con<number>,

    /**
     * ID of the start {@link Point} of the slice.
     */
    x1: nodes.con<ITimestampStruct>,

    /**
     * ID of the end {@link Point} of the slice, if 0 then it is equal to x1.
     */
    x2: nodes.con<ITimestampStruct | 0>,

    /**
     * App specific type of the slice. For slices with "Marker" stacking
     * behavior, this is a path of block nesting. For other slices, it
     * specifies inline formatting, such as bold, italic, etc.; the value has
     * to be a primitive number or a string.
     */
    // type: nodes.con<SliceType>,
    type: nodes.con<TypeTag> | nodes.arr<
      nodes.con<TypeTag> |
      nodes.vec<[
        tag: nodes.con<TypeTag>,
        discriminant: nodes.con<number>,
        data: nodes.obj<// biome-ignore lint: TODO: improve the type of the data node
        {}>,
      ]>
    >,

    /**
     * Reference to additional metadata about the slice, usually an object.
     * Normally used for inline formatting, block formatting attaches data to
     * specific block tags in the steps of the `type` field. This field is
     * optional.
     */
    data: nodes.obj<// biome-ignore lint: TODO: improve the type of the data node
    {}>,
  ]
>;

/**
 * JSON CRDT node representation of the stored slices.
 */
export type SliceNode = SchemaToJsonNode<SliceSchema>;

/**
 * The view of a stored slice.
 */
export type SliceView = JsonNodeView<SliceNode>;

/**
 * Slices represent Peritext's rich-text formatting/annotations. The "slice"
 * concept captures both: (1) range annotations; as well as, (2) *markers*,
 * which are a single-point annotations. The markers are used as block splits,
 * e.g. paragraph, heading, blockquote, etc. In markers, the start and end
 * positions of the range are normally the same, but could also wrap around
 * a single RGA chunk.
 */
export interface Slice<T = string> extends Range<T>, Stateful {
  /**
   * ID of the slice. ID is used for layer sorting.
   */
  id: ITimestampStruct;

  /**
   * The low-level stacking behavior of the slice. Specifies whether the
   * slice is a split, i.e. a "marker" for a block split, in which case it
   * represents a single place in the text where text is split into blocks.
   * Otherwise, specifies the low-level behavior or the rich-text formatting
   * of the slice.
   */
  stacking: SliceStacking;

  /**
   * The high-level behavior identifier of the slice. Specifies the
   * user-defined type of the slice, e.g. paragraph, heading, blockquote, etc.
   *
   * Usually the type is a number or string primitive, in which case it is
   * referred to as *tag*.
   *
   * The type is a list only for nested blocks, e.g. `['ul', 'li']`, in which
   * case the type is a list of tags. The last tag in the list is the
   * "leaf" tag, which is the type of the leaf block element.
   */
  type: SliceType;

  /**
   * High-level user-defined metadata of the slice, which accompanies the slice
   * type.
   */
  data(): unknown | undefined;
}

export interface MutableSlice<T = string> extends Slice<T> {
  update(params: SliceUpdateParams<T>): void;

  /**
   * Delete this slice from its backing store.
   */
  del(): void;

  /**
   * Whether the slice is deleted.
   */
  isDel(): boolean;
}

/**
 * Parameters for updating a slice.
 */
export interface SliceUpdateParams<T> {
  /**
   * When set, updates the stacking behavior of the slice.
   */
  stacking?: SliceStacking;

  /**
   * When set, updates the type of the slice.
   */
  type?: SliceType;

  /**
   * When set, overwrites the custom data of the slice. To edit the data more
   * granularly, use the `dataNode()` method of the slice instead, to get
   * access to the data node.
   */
  data?: unknown;

  /**
   * When set, updates the range and endpoint anchors of the slice.
   */
  range?: Range<T>;
}
