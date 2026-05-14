import type {TranslitScheme} from '../types';

/**
 * Russian "phonetic" (Apple-style) scheme — strict 1:1 mapping of ASCII keys
 * to Cyrillic letters.
 */
export const ruPhonetic: TranslitScheme = {
  id: 'ru-phonetic',
  name: 'Russian (phonetic)',
  short: 'RU',
  language: 'ru',
  script: 'Cyrl',
  kind: 'alphabet',
  rules: [
    {in: 'a', out: 'а'},
    {in: 'b', out: 'б'},
    {in: 'v', out: 'в'},
    {in: 'g', out: 'г'},
    {in: 'd', out: 'д'},
    {in: 'e', out: 'е'},
    {in: 'z', out: 'з'},
    {in: 'i', out: 'и'},
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

    // Letters without obvious Latin analogues — assigned to remaining ASCII keys.
    {in: 'q', out: 'я'},
    {in: 'w', out: 'в'},
    {in: 'x', out: 'ь'},
    {in: 'j', out: 'й'},
  ],
};
