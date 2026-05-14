import {put} from './css';
import {ROOT_DECLS, DESCENDANT_RULES, KEYFRAMES} from './reset-rules';

export const googleFonts =
  'https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,800|Roboto+Mono|Merriweather:300,400,700|Roboto+Slab:300,400,700|Roboto:300,500|Ubuntu:400&subset=cyrillic';

const isClient = typeof window === 'object';

let applied = false;

/**
 * Install the single page-wide global CSS used by json-joy apps. Apps own
 * the page and call this once at startup.
 */
export const applyGlobalReset = (): void => {
  if (applied) return;
  applied = true;

  if (isClient) {
    const el = document.createElement('link');
    el.href = googleFonts;
    el.rel = 'stylesheet';
    el.type = 'text/css';
    document.head.appendChild(el);
  }

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
