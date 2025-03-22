import type {Range} from '../rga/Range';
import type {Stateful} from '../types';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SliceBehavior} from './constants';
import type {nodes} from '../../../json-crdt-patch';
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
export type SliceType = SliceTypeStep | SliceTypeStep[];
export type SliceTypeStep = string | number | [tag: string | number, discriminant: number];

/**
 * The JSON CRDT schema of the stored slices in the document. The slices are
 * stored compactly in "vec" nodes, with the first *header* element storing
 * multiple values in a single integer.
 */
export type SliceSchema = nodes.vec<
  [
    /**
     * The header stores the behavior {@link SliceBehavior} of the slice as well
     * as anchor {@link Anchor} points of the x1 and x2 points.
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
     * App specific type of the slice. For slices with "split" behavior, this
     * is a path of block nesting. For other slices, it specifies inline formatting, such
     * as bold, italic, etc.; the value has to be a primitive number or a string.
     */
    type: nodes.con<SliceType>,
    /**
     * Reference to additional metadata about the slice, usually an object. If
     * data is not set, it will default to `1`. For "erase" slice behavior, data
     * should not be specified.
     *
     * In reality this `vec` term can be of any type, it can even be missing
     * entirely. It is typed here as a placeholder for the actual data type.
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
   * The low-level behavior of the slice. Specifies whether the slice is a split,
   * i.e. a "marker" for a block split, in which case it represents a single
   * place in the text where text is split into blocks. Otherwise, specifies
   * the low-level behavior or the rich-text formatting of the slice.
   */
  behavior: SliceBehavior;

  /**
   * The high-level behavior of the slice. Specifies the user-defined type of the
   * slice, e.g. paragraph, heading, blockquote, etc.
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
   * When set, updates the behavior of the slice.
   */
  behavior?: SliceBehavior;

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
