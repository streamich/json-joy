import {put} from './css';
import {ROOT_DECLS, DESCENDANT_RULES, KEYFRAMES} from './reset-rules';

const CLASS = 'jj-reset';

// Specificity bump: `.jj-reset.jj-reset` matches the same elements as
// `.jj-reset` (the class only needs to be applied once in the DOM) but with
// specificity (0,2,0) instead of (0,1,0).
const SELECTOR = `.${CLASS}.${CLASS}`;

let emitted = false;

/**
 * Returns a stable class name that, when applied to an element, gives its
 * subtree the same baseline normalization that `global-reset.ts` installs
 * page-wide and, additionally, defends against host-page CSS leaking in:
 *
 *  1. `all: revert` on the boundary + descendants rolls back every host
 *  author-stylesheet declaration to user-agent defaults. Our own reset
 *  rules then redeclare what we need on top.
 *  2. `contain: layout style` on the boundary stops layout and
 *  counter-reset scoping from leaking out into the host page.
 *  3. The reset selectors carry doubled specificity so equal-specificity
 *  host rules lose regardless of stylesheet load order.
 */
export const getScopedResetClass = (): string => {
  if (emitted) return CLASS;
  emitted = true;

  // Inbound fence. Emitted BEFORE our own rules so that at equal
  // specificity our redeclarations win on source order.
  put(`${SELECTOR}, ${SELECTOR} *`, {all: 'revert'});

  put(SELECTOR, {
    contain: 'layout style',
    ...ROOT_DECLS,
    ...DESCENDANT_RULES,
  });

  // Keyframes are name-scoped globally by definition; emit once.
  put('', KEYFRAMES);

  return CLASS;
};
