import type {TranslitScheme} from '../types';

/**
 *   a  → а    b  → б    v  → в    g  → г    d  → д
 *   e  → е    yo → ё    zh → ж    z  → з    i  → и
 *   j  → й    k  → к    l  → л    m  → м    n  → н
 *   o  → о    p  → п    r  → р    s  → с    t  → т
 *   u  → у    f  → ф    h  → х    c  → ц    ch → ч
 *   sh → ш    shh→ щ    '  → ь    '' → ъ    y  → ы
 *   yu → ю    ya → я
 */
export const ruTranslit: TranslitScheme = {
  id: 'ru-translit',
  name: 'Russian (translit)',
  short: 'RU',
  language: 'ru',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    // Trigraphs.
    {in: 'shh', out: 'щ'},

    // Digraphs.
    {in: 'sh', out: 'ш'},
    {in: 'ch', out: 'ч'},
    {in: 'zh', out: 'ж'},
    {in: 'yo', out: 'ё'},
    {in: 'yu', out: 'ю'},
    {in: 'ya', out: 'я'},
    {in: 'je', out: 'э'},
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
    {in: 'y', out: 'ы'},
  ],
};
