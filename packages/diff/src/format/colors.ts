import type {DiffColors} from './types';

/**
 * Wraps one piece of output in a {@link DiffColors} escape, or leaves it alone
 * when the writer was given no palette.
 *
 * The reset is passed separately rather than read off the palette on every call
 * because a writer resolves it once per diff, and because a palette with an
 * `open` but no `reset` must still be usable — a caller emitting HTML has no
 * single closing string.
 *
 * @param open The escape for this piece, from a {@link DiffColors} field.
 * @param text The piece, without its terminator.
 * @param reset Written after `text`; `''` when the palette named none.
 */
export const paint = (open: string | undefined, text: string, reset: string): string =>
  open === undefined ? text : open + text + reset;
