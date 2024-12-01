import type {UndefIterator} from '../../../util/iterator';
import type {Point} from '../rga/Point';
import type {SliceType} from '../slice';
import type {ChunkSlice} from '../util/ChunkSlice';

export type CharIterator<T> = UndefIterator<ChunkSlice<T>>;
export type CharPredicate<T> = (char: T) => boolean;

export type Position<T = string> = number | [at: number, anchor: 0 | 1] | Point<T>;
export type TextRangeUnit = 'point' | 'char' | 'word' | 'line' | 'block' | 'all';

export type ViewRange = [text: string, textPosition: number, slices: ViewSlice[]];

export type ViewSlice = [header: number, x1: number, x2: number, type: SliceType, data?: unknown];
