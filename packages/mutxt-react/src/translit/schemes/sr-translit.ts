import type {TranslitScheme} from '../types';

/**
 * Serbian Cyrillic translit. Uses Serbian Latin orthography conventions:
 *
 *   dj → ђ    tj → ћ    lj → љ    nj → њ    dz → џ
 *   zh → ж   sh → ш    ch → ч
 */
export const srTranslit: TranslitScheme = {
  id: 'sr-translit',
  name: 'Serbian (translit)',
  short: 'SR',
  language: 'sr',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'dj', out: 'ђ'},
    {in: 'tj', out: 'ћ'},
    {in: 'lj', out: 'љ'},
    {in: 'nj', out: 'њ'},
    {in: 'dz', out: 'џ'},
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
