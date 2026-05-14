import {put} from './css';
import {ROOT_DECLS, DESCENDANT_RULES, KEYFRAMES} from './reset-rules';
import {loadGoogleFonts} from './fonts';

export {googleFonts} from './fonts';

let applied = false;

/**
 * Install the single page-wide global CSS used by json-joy apps. Apps own
 * the page and call this once at startup.
 */
export const applyGlobalReset = (): void => {
  if (applied) return;
  applied = true;

  loadGoogleFonts();

  put('', {
    ':root': {colorScheme: 'light dark'},
    // `text-size-adjust` is honored on `<html>` (not `<body>`) by iOS Safari,
    // so apply the root decls to both.
    'html,body': ROOT_DECLS,
    body: {margin: 0},
    ...DESCENDANT_RULES,
    ...KEYFRAMES,
    '.slideInDown': {animation: 'slideInDown .3s'},
    '.hoverRotate': {
      trs: 'transform .2s',
      transformOrigin: 'bottom left',
      '&:hover': {transform: 'rotate(-2deg)'},
    },
  });
};

applyGlobalReset();
