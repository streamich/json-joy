import {PersistedSlice} from './PersistedSlice';

/**
 * Represents a block split in the text, i.e. it is a *marker* that shows
 * where a block was split. Markers also insert one "\n" new line character.
 * Both marker ends are attached to the "before" anchor fo the "\n" new line
 * character, i.e. it is *collapsed* to the "before" anchor.
 */
export class MarkerSlice<T = string> extends PersistedSlice<T> {}
