import type {TranslitScheme} from '../types';

/**
 * Esperanto x-system. Latin pass-through with six digraphs:
 *
 *   cx → ĉ    gx → ĝ    hx → ĥ    jx → ĵ    sx → ŝ    ux → ŭ
 *
 * All other Latin letters fall through unchanged. The matcher is
 * specifically suited to this convention because typing `c` buffers
 * pending the possible `cx`; if any other char follows, the buffered
 * `c` is committed literal and the next char is reprocessed.
 */
export const eoXsystem: TranslitScheme = {
  id: 'eo-xsystem',
  name: 'Esperanto (x-system)',
  short: 'EO',
  language: 'eo',
  script: 'Latn',
  kind: 'alphabet',
  rules: [
    {in: 'cx', out: 'ĉ'},
    {in: 'gx', out: 'ĝ'},
    {in: 'hx', out: 'ĥ'},
    {in: 'jx', out: 'ĵ'},
    {in: 'sx', out: 'ŝ'},
    {in: 'ux', out: 'ŭ'},
  ],
};
