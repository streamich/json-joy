import type {TranslitScheme} from '../types';

/**
 * Ukrainian translit. Same shape as Russian translit but with the Ukrainian
 * letter set: і / ї / є / ґ added; ё / ъ / ы / э dropped.
 *
 *   y → и    i → і    yi → ї    ye → є    gh → ґ
 */
export const ukTranslit: TranslitScheme = {
  id: 'uk-translit',
  name: 'Ukrainian (translit)',
  short: 'UK',
  language: 'uk',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    // Trigraphs.
    {in: 'shh', out: 'щ'},

    // Digraphs.
    {in: 'sh', out: 'ш'},
    {in: 'ch', out: 'ч'},
    {in: 'zh', out: 'ж'},
    {in: 'yu', out: 'ю'},
    {in: 'ya', out: 'я'},
    {in: 'ye', out: 'є'},
    {in: 'yi', out: 'ї'},
    {in: 'gh', out: 'ґ'},

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
    {in: 'y', out: 'и'},
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
    {in: 'f', out: 'ф'},
    {in: 'h', out: 'х'},
    {in: 'c', out: 'ц'},
  ],
};
