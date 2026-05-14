import {put} from './css';
import {ROOT_DECLS, DESCENDANT_RULES, KEYFRAMES} from './reset-rules';

const CLASS = 'jj-reset';

let emitted = false;

/**
 * Returns a stable class name that, when applied to an element, gives its
 * subtree the same baseline normalization that `global-reset.ts` installs
 * page-wide. Lazy and idempotent.
 */
export const getScopedResetClass = (): string => {
  if (emitted) return CLASS;
  emitted = true;

  put('.' + CLASS, {
    ...ROOT_DECLS,
    ...DESCENDANT_RULES,
  });

  // Keyframes are name-scoped globally by definition; emit once.
  put('', KEYFRAMES);

  return CLASS;
};
