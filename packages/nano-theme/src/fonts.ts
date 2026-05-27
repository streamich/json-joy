export const googleFonts =
  'https://fonts.googleapis.com/css?family=Inter:400,500,600,700,800|Open+Sans:300,400,700,800|Roboto+Mono|Merriweather:300,400,700|Roboto+Slab:300,400,700|Roboto:300,500|Ubuntu:400&subset=cyrillic';

const isClient = typeof window === 'object';
let loaded = false;

/**
 * Idempotently inject a `<link rel="stylesheet">` for the json-joy Google
 * Fonts bundle. Called by both `applyGlobalReset` (host-app mode) and
 * `getScopedResetClass` (embeddable mode) so the same typography is
 * available regardless of which entry point a consumer uses.
 */
export const loadGoogleFonts = (): void => {
  if (loaded || !isClient) return;
  loaded = true;
  const el = document.createElement('link');
  el.href = googleFonts;
  el.rel = 'stylesheet';
  el.type = 'text/css';
  document.head.appendChild(el);
};
