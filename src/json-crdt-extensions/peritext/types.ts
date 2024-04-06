import type {ITimestampStruct} from '../../json-crdt-patch';
import type {Path, PathStep} from '../../json-pointer';

/**
 * Represents an object which state can change over time.
 */
export interface Stateful {
  /**
   * Hash of the current state. Updated by calling `refresh()`.
   */
  hash: number;

  /**
   * Recomputes object's hash.
   * @returns The new hash.
   */
  refresh(): number;
}

export type IdDto = [sid: number, time: number];

export type SpanDto = [sid: number, time: number, length: number];

export type SliceType = PathStep | Path;

export type SliceDto = [
  /**
   * Stores the behavior of the slice as well as anchor points of x1 and x2.
   */
  flags: number,

  /**
   * Start point of the slice.
   */
  x1: ITimestampStruct,

  /**
   * End point of the slice, if 0 then it is equal to x1.
   */
  x2: ITimestampStruct | 0,

  /**
   * App specific type of the slice. For slices with "split" behavior, this
   * is a path of block nesting. For other slices, it specifies inline formatting, such
   * as bold, italic, etc.; the value has to be a primitive number or a string.
   */
  type: SliceType,

  /**
   * Reference to additional metadata about the slice, usually an object. If
   * data is not set, it will default to `1`. For "erase" slice behavior, data
   * should not be specified.
   */
  data?: unknown,
];
