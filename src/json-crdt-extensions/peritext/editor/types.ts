import type {UndefIterator} from '../../../util/iterator';
import type {Anchor} from '../rga/constants';
import type {Point} from '../rga/Point';
import type {SliceType} from '../slice';
import type {SliceBehavior} from '../slice/constants';
import type {ChunkSlice} from '../util/ChunkSlice';

export type CharIterator<T> = UndefIterator<ChunkSlice<T>>;
export type CharPredicate<T> = (char: T) => boolean;

export type Position<T = string> = number | [at: number, anchor: 0 | 1] | Point<T>;
export type TextRangeUnit = 'point' | 'char' | 'word' | 'line' | 'block' | 'all';

export type ViewRange = [
  text: string,
  slices: ViewSlice[],
];

export type ViewSlice = [
  x1: number,
  a1: Anchor,
  x2: number,
  a2: Anchor,
  behavior: SliceBehavior,
  type: SliceType,
  data?: unknown,
];
