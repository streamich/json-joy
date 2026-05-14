import type {TranslitScheme} from '../types';

/**
 * Hebrew (consonantal) translit. Final letters (ך / ם / ן / ף / ץ) handled
 * via `finalForms` on word boundaries. RTL is handled by the browser's
 * built-in bidi algorithm — the matcher just emits Unicode codepoints.
 *
 * Vowels follow Hebrew abjad conventions: short `a` and `e` are silently
 * dropped (no glyph), while long `i / o / u` map to mater lectionis
 * (י / ו / ו). To force a long alif, type `aa → א`.
 */
export const heTranslit: TranslitScheme = {
  id: 'he-translit',
  name: 'Hebrew (translit)',
  short: 'HE',
  language: 'he',
  script: 'Hebr',
  direction: 'rtl',
  kind: 'alphabet',
  rules: [
    // Digraphs (consonants + long-alif `aa → א`).
    {in: 'aa', out: 'א'},
    {in: 'ch', out: 'ח'},
    {in: 'tt', out: 'ט'},
    {in: 'sh', out: 'ש'},
    {in: 'ts', out: 'צ'},

    // Ayin uses the apostrophe key (Russian convention `'` → ь does not apply here).
    {in: "'", out: 'ע', caseFold: false},

    // Vowels: short a/e silent; long i/o/u via mater lectionis.
    {in: 'a', out: ''},
    {in: 'e', out: ''},
    {in: 'i', out: 'י'},
    {in: 'o', out: 'ו'},
    {in: 'u', out: 'ו'},

    // Consonants.
    {in: 'b', out: 'ב'},
    {in: 'g', out: 'ג'},
    {in: 'd', out: 'ד'},
    {in: 'h', out: 'ה'},
    {in: 'v', out: 'ו'},
    {in: 'z', out: 'ז'},
    {in: 'y', out: 'י'},
    {in: 'k', out: 'כ'},
    {in: 'l', out: 'ל'},
    {in: 'm', out: 'מ'},
    {in: 'n', out: 'נ'},
    {in: 's', out: 'ס'},
    {in: 'p', out: 'פ'},
    {in: 'q', out: 'ק'},
    {in: 'r', out: 'ר'},
    {in: 't', out: 'ת'},
  ],
  finalForms: {
    כ: 'ך',
    מ: 'ם',
    נ: 'ן',
    פ: 'ף',
    צ: 'ץ',
  },
};
