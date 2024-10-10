import type {UndefIterator} from '../../../util/iterator';
import type {ChunkSlice} from '../util/ChunkSlice';

export type CharIterator<T> = UndefIterator<ChunkSlice<T>>;
export type CharPredicate<T> = (char: T) => boolean;
