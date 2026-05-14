import type {TranslitScheme} from '../types';

/**
 * Belarusian translit. Adds і and ў; drops и / щ / ъ. Keeps ё / ы / э.
 *
 *   i → і    w → ў    y → ы    je → э    yo → ё
 */
export const beTranslit: TranslitScheme = {
  id: 'be-translit',
  name: 'Belarusian (translit)',
  short: 'BE',
  language: 'be',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'sh', out: 'ш'},
    {in: 'ch', out: 'ч'},
    {in: 'zh', out: 'ж'},
    {in: 'yo', out: 'ё'},
    {in: 'yu', out: 'ю'},
    {in: 'ya', out: 'я'},
    {in: 'je', out: 'э'},

    // Soft sign.
    {in: "'", out: 'ь', caseFold: false},

    // Single chars.
    {in: 'a', out: 'а'},
    {in: 'b', out: 'б'},
    {in: 'v', out: 'в'},
    {in: 'g', out: 'г'},
    {in: 'd', out: 'д'},
    {in: 'e', out: 'е'},
    {in: 'z', out: 'з'},
    {in: 'i', out: 'і'},
    {in: 'j', out: 'й'},
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
    {in: 'w', out: 'ў'},
    {in: 'f', out: 'ф'},
    {in: 'h', out: 'х'},
    {in: 'c', out: 'ц'},
    {in: 'y', out: 'ы'},
  ],
};
