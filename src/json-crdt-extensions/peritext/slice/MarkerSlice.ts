import {PersistedSlice} from './PersistedSlice';

/**
 * Represents a block split in the text, i.e. it is a *marker* that shows
 * where a block was split.
 *
 * @deprecated
 */
export class MarkerSlice<T = string> extends PersistedSlice<T> {}
