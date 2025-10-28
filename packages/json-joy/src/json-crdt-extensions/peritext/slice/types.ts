import type {Range} from '../rga/Range';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SliceStacking, SliceTypeCon} from './constants';
import type {NodeBuilder, nodes} from '../../../json-crdt-patch';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import type {JsonNodeView} from '../../../json-crdt/nodes';

/**
 * Represents a developer-defined type of a slice, allows developers to assign
 * rich-text formatting or block types to slices.
 *
 * For example:
 *
 * ```ts
 * 'bold'
 * '<b>'
 * 'p'
 * '<p>'
 * ['paragraph']
 * ['<p>']
 * ```
 *
 * Slice types can specify block nesting:
 *
 * ```ts
 * ['blockquote', 'paragraph']
 * ['<blockquote>', '<p>']
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
 *
 * Each block nesting level can have a custom data object:
 *
 * ```ts
 * [['<blockquote>', 0, {author: 'Alice'}], '<p>']
 * [
 *   ['list', 0, {type: 'ordered'}],
 *   '<li>',
 *   ['<p>', 0, {indent: 2}]
 * ]
 * ```
 */
export type SliceType = TypeTag | SliceTypeSteps;
export type SliceTypeSteps = SliceTypeStep[];
export type SliceTypeStep = TypeTag | SliceTypeCompositeStep;
export type SliceTypeCompositeStep = [tag: TypeTag, discriminant: number, data?: Record<string, unknown>];

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
     *
     * Inline formatting is encoded as a single "con" node:
     *
     * ```ts
     * s.con('bold')
     * ```
     *
     * The most basic one-level block split can be encoded as a single
     * "con" node:
     *
     * ```ts
     * s.con('p')
     * ```
     *
     * Nested blocks are encoded as an "arr" node of "con" nodes or "vec" tuples.
     * The "con" nodes are when only the tag is specified, while the "vec" tuples
     * are used when the tag is accompanied by a discriminant and/or custom data
     * (attributes of the block).
     *
     * ```ts
     * s.vec([
     *   s.con('blockquote'),
     *   s.con('p')
     * ])
     *
     * s.vec([
     *  // <ul:0>
     *  s.con('ul'),
     *
     *  // <li:1>
     *  s.vec([
     *   s.con('li'),
     *   s.con(1), // discriminant
     *  ]),
     *
     *  // <p:0 indent="2">
     *  s.vec([
     *    s.con('p'),
     *    s.con(0), // discriminant
     *    s.obj({ // data
     *      indent: 2,
     *    }),
     *  ]),
     * ])
     * ```
     */
    type:
      | nodes.con<TypeTag>
      | nodes.arr<
          | nodes.con<TypeTag>
          | nodes.vec<[tag: nodes.con<TypeTag>, discriminant: nodes.con<number>, data: nodes.obj<{}>]>
        >,
    /**
     * Reference to additional metadata about the slice, usually an object.
     * Normally used for inline formatting, block formatting attaches data to
     * specific block tags in the steps of the `type` field. This field is
     * optional.
     */
    data: nodes.obj<{}>,
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
  type?: SliceType | NodeBuilder;

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
