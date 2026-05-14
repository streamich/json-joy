import {put} from './css';
import {
  ROOT_DECLS,
  DESCENDANT_RULES,
  KEYFRAMES,
  Rules,
} from './reset-rules';
import {loadGoogleFonts} from './fonts';

const CLASS = 'jj-reset';

// Two scopes with different cascade weight:
//
//  - Root decls (`font-family`, `color`, `accent-color`, etc.) apply only to
//  the boundary element itself. Doubled-class specificity `(0,2,0)` so
//  host rules at `(0,0,1)` / `(0,1,0)` lose.
//  - Descendant decls (`:where(h1,...) {margin: 0}`, `a,button {bdrad: 2px}`,
//  `button:focus-visible {outline}`, etc.) need to STAY OUT OF THE WAY of
//  component classes inside mu-txt.
const ROOT_SELECTOR = `.${CLASS}.${CLASS}`;
const DESCENDANT_SCOPE = `:where(.${CLASS})`;

let emitted = false;

const DEFENSIVE_ROOT_DECLS: Rules = {
  ta: 'start',
  textTransform: 'none',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  whiteSpace: 'normal',
  cur: 'auto',
  caretColor: 'auto',
};

export const DEFENSIVE_DESCENDANT_RULES: Rules = {
  svg: {d: 'inline-block', va: 'middle'},
};

export const getScopedResetClass = (): string => {
  if (emitted) return CLASS;
  emitted = true;

  loadGoogleFonts();

  put(ROOT_SELECTOR, {...ROOT_DECLS, ...DEFENSIVE_ROOT_DECLS});
  put(DESCENDANT_SCOPE, {...DESCENDANT_RULES, ...DEFENSIVE_DESCENDANT_RULES});

  // Keyframes are name-scoped globally by definition; emit once.
  put('', KEYFRAMES);

  return CLASS;
};
