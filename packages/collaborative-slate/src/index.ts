import type {Editor} from 'slate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';
import {SlateFacade} from './SlateFacade';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext/lib/types';

export type * from './types';
export {SlateFacade} from './SlateFacade';
export type {SlateFacadeOpts} from './SlateFacade';

export {PresenceLeaf, withPresenceLeaf} from './presence/PresenceLeaf';
export {useSlatePresence, type UseSlatePresenceOpts} from './presence/useSlatePresence';
export type * from './presence/types';

/**
 * Convenience function that creates a {@link SlateFacade} and wires it to the
 * Peritext CRDT via {@link PeritextBinding}.
 *
 * @param peritext - A {@link PeritextRef} accessor that returns the current
 *   `PeritextApi` from your json-joy model.
 * @param editor - The Slate.js `Editor` instance (created with
 *   `withReact(createEditor())`; also works with Plate.js editors).
 * @returns An `unbind` cleanup function. Call it when the component unmounts
 *   to disconnect the editor from the CRDT.
 *
 * @example
 * ```ts
 * const unbind = bind(() => model.s.toExt(), editor);
 * // on unmount:
 * unbind();
 * ```
 */
export const bind = (peritext: PeritextRef, editor: Editor): (() => void) => {
  const facade = new SlateFacade(editor, peritext);
  return PeritextBinding.bind(peritext, facade);
};
