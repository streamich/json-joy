import type {TranslitScheme} from '../types';

/**
 * Georgian (Mkhedruli) translit, phonetic 1:1.
 *
 *   a→ა  b→ბ  g→გ  d→დ  e→ე  v→ვ  z→ზ  th→თ  i→ი  k→კ
 *   l→ლ  m→მ  n→ნ  o→ო  p→პ  zh→ჟ  r→რ  s→ს  t→ტ  u→უ
 *   ph→ფ  q→ქ  gh→ღ  y→ყ  sh→შ  ch→ჩ  ts→ც  dz→ძ  c→წ
 *   cj→ჭ  x→ხ  j→ჯ  h→ჰ
 */
export const kaTranslit: TranslitScheme = {
  id: 'ka-translit',
  name: 'Georgian (translit)',
  short: 'KA',
  language: 'ka',
  script: 'Geor',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'th', out: 'თ'},
    {in: 'zh', out: 'ჟ'},
    {in: 'ph', out: 'ფ'},
    {in: 'gh', out: 'ღ'},
    {in: 'sh', out: 'შ'},
    {in: 'ch', out: 'ჩ'},
    {in: 'ts', out: 'ც'},
    {in: 'dz', out: 'ძ'},
    {in: 'cj', out: 'ჭ'},

    // Single chars.
    {in: 'a', out: 'ა'},
    {in: 'b', out: 'ბ'},
    {in: 'g', out: 'გ'},
    {in: 'd', out: 'დ'},
    {in: 'e', out: 'ე'},
    {in: 'v', out: 'ვ'},
    {in: 'z', out: 'ზ'},
    {in: 'i', out: 'ი'},
    {in: 'k', out: 'კ'},
    {in: 'l', out: 'ლ'},
    {in: 'm', out: 'მ'},
    {in: 'n', out: 'ნ'},
    {in: 'o', out: 'ო'},
    {in: 'p', out: 'პ'},
    {in: 'r', out: 'რ'},
    {in: 's', out: 'ს'},
    {in: 't', out: 'ტ'},
    {in: 'u', out: 'უ'},
    {in: 'q', out: 'ქ'},
    {in: 'y', out: 'ყ'},
    {in: 'c', out: 'წ'},
    {in: 'x', out: 'ხ'},
    {in: 'j', out: 'ჯ'},
    {in: 'h', out: 'ჰ'},
    {in: 'f', out: 'ფ'},
  ],
};
