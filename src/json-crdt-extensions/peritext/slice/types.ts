import type {Range} from '../rga/Range';
import type {SliceType, Stateful} from '../types';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SliceBehavior} from './constants';

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
   * Whether the slice is deleted.
   */
  isDel(): boolean;
}

export interface SliceUpdateParams<T> {
  behavior?: SliceBehavior;
  type?: SliceType;
  data?: unknown;
  range?: Range<T>;
}
