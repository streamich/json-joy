import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {CustomStyle} from './types';

/**
 * Hard-coded fallback used as the bottom of the cascade. Also used as the
 * shown "default" value in the panel — the user sees this when a field is
 * in default (`def: true`) mode and can override it from there.
 */
export const DEFAULTS: Required<CustomStyle> = {
  ff: 'sans',
  fz: 16,
  fw: 400,
  fs: 100,
  os: true,
  lig: 'common',
  nv: 'normal',
  lh: 1.5,
  ls: 0,
  ws: 0,
  krn: 'auto',
  it: false,
  caps: false,
  smcp: false,
  uo: 0.15,
  dt: 0.06,
  fg: '#1a1a1a',
  bg: '#ffffff',
};

/** Built-in `FontKind` shorthands plus a few common alternatives. */
export const FONT_OPTIONS: MenuItem[] = [
  {id: 'sans', name: 'Sans'},
  {id: 'serif', name: 'Serif'},
  {id: 'slab', name: 'Slab'},
  {id: 'mono', name: 'Mono'},
];
