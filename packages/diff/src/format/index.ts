/**
 * Diff wire formats. Turns a `LinePatch` plus the two line arrays it was
 * computed from into each of the output styles, and (from E4) back again. The
 * formats are as reusable as the algorithms: an editor, a review UI or a sync
 * layer wants a unified diff without a shell attached.
 *
 * Nothing in `str`, `line` or `lines` imports this, so callers that only diff
 * never load it.
 */
export * from './apply';
export * from './colors';
export * from './context';
export * from './ed';
export * from './flags';
export * from './groups';
export * from './hunks';
export * from './ifdef';
export * from './normal';
export * from './parse';
export * from './rcs';
export * from './side';
export * from './tabs';
export * from './types';
export * from './unified';
