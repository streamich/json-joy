import type {TranslitScheme} from '../types';

/**
 * Macedonian translit. Uses standard Macedonian Latin → Cyrillic digraphs:
 *
 *   gj → ѓ    kj → ќ    lj → љ    nj → њ
 *   dz → ѕ    dj → џ    zh → ж    sh → ш    ch → ч
 */
export const mkTranslit: TranslitScheme = {
  id: 'mk-translit',
  name: 'Macedonian (translit)',
  short: 'MK',
  language: 'mk',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'gj', out: 'ѓ'},
    {in: 'kj', out: 'ќ'},
    {in: 'lj', out: 'љ'},
    {in: 'nj', out: 'њ'},
    {in: 'dz', out: 'ѕ'},
    {in: 'dj', out: 'џ'},
    {in: 'zh', out: 'ж'},
    {in: 'sh', out: 'ш'},
    {in: 'ch', out: 'ч'},

    // Single chars.
    {in: 'a', out: 'а'},
    {in: 'b', out: 'б'},
    {in: 'v', out: 'в'},
    {in: 'g', out: 'г'},
    {in: 'd', out: 'д'},
    {in: 'e', out: 'е'},
    {in: 'z', out: 'з'},
    {in: 'i', out: 'и'},
    {in: 'j', out: 'ј'},
    {in: 'k', out: 'к'},
    {in: 'l', out: 'л'},
    {in: 'm', out: 'м'},
    {in: 'n', out: 'н'},
    {in: 'o', out: 'о'},
    {in: 'p', out: 'п'},
    {in: 'r', out: 'р'},
    {in: 's', out: 'с'},
    {in: 't', out: 'т'},
    {in: 'u', out: 'у'},
    {in: 'f', out: 'ф'},
    {in: 'h', out: 'х'},
    {in: 'c', out: 'ц'},
  ],
};
