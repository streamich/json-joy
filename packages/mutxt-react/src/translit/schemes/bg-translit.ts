import type {TranslitScheme} from '../types';

/**
 * Bulgarian translit. Russian rules minus ё / ы / э, with Bulgarian's
 * `sht → щ` digraph (Bulgarian щ is pronounced "sht").
 *
 *   a→а  b→б  v→в  g→г  d→д  e→е  zh→ж  z→з  i→и  y→й
 *   k→к  l→л  m→м  n→н  o→о  p→п  r→р  s→с  t→т  u→у
 *   f→ф  h→х  c→ц  ch→ч  sh→ш  sht→щ  '→ь  ''→ъ  yu→ю  ya→я
 */
export const bgTranslit: TranslitScheme = {
  id: 'bg-translit',
  name: 'Bulgarian (translit)',
  short: 'BG',
  language: 'bg',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    // Trigraphs.
    {in: 'sht', out: 'щ'},

    // Digraphs.
    {in: 'sh', out: 'ш'},
    {in: 'ch', out: 'ч'},
    {in: 'zh', out: 'ж'},
    {in: 'yu', out: 'ю'},
    {in: 'ya', out: 'я'},
    {in: "''", out: 'ъ'},

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
    {in: 'i', out: 'и'},
    {in: 'y', out: 'й'},
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
