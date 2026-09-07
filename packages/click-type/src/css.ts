import type {Styles} from '@jsonjoy.com/ui/lib/styles/Styles';
import {rule} from 'nano-theme';

/**
 * Every theme colour used across click-type, published once as CSS variables on
 * the tree root (see `index.tsx`).
 */
export const cssVars = (s: Styles): Record<string, string> => ({
  '--ct-text': s.g(0.1), // primary monospace text
  '--ct-strong': s.g(0.05), // titles, key names (bold)
  '--ct-label': s.g(0.5), // field labels, optional marker, colon, section header
  '--ct-muted': s.g(0.45), // trailers, example meta
  '--ct-desc': s.g(0.4), // descriptions
  '--ct-dim': s.g(0.3), // section label, plain option values
  '--ct-toggle': s.g(0.55), // collapse chevrons
  '--ct-accent': `${s.link}`, // hover / active
  '--ct-line': s.g(0.1, 0.2), // vertical connector guides
  '--ct-divider': s.g(0.85), // horizontal example separator
  '--ct-num': s.light ? '#0a8f3f' : '#0faf4f', // numeric values
  '--ct-enum': s.light ? '#411888' : '#9168c8', // enum / bool values
});

export const rowBox = rule({d: 'inline-block', va: 'top'});
export const keyName = rule({fw: 'bold', cur: 'default', us: 'none', col: 'var(--ct-strong)'});
export const optional = rule({col: 'var(--ct-label)'});
