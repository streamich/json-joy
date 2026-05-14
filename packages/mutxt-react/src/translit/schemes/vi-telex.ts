import type {TranslitScheme} from '../types';

/**
 * Vietnamese Telex input. The classic showcase for digraph-with-extension:
 * type `a` then `a` and the matcher rewrites `a` → `â`; type `a` then `s`
 * and the matcher rewrites `a` → `á`.
 *
 *   Modifier digraphs:  aa→â  ee→ê  oo→ô  aw→ă  ow→ơ  uw→ư  dd→đ
 *   Tones (suffix):     s→sắc  f→huyền  r→hỏi  x→ngã  j→nặng
 */
export const viTelex: TranslitScheme = {
  id: 'vi-telex',
  name: 'Vietnamese (Telex)',
  short: 'VI',
  language: 'vi',
  script: 'Latn',
  kind: 'alphabet',
  rules: [
    // Trigraphs: modified vowel + tone.
    // â family (aa).
    {in: 'aas', out: 'ấ'},
    {in: 'aaf', out: 'ầ'},
    {in: 'aar', out: 'ẩ'},
    {in: 'aax', out: 'ẫ'},
    {in: 'aaj', out: 'ậ'},
    // ê family (ee).
    {in: 'ees', out: 'ế'},
    {in: 'eef', out: 'ề'},
    {in: 'eer', out: 'ể'},
    {in: 'eex', out: 'ễ'},
    {in: 'eej', out: 'ệ'},
    // ô family (oo).
    {in: 'oos', out: 'ố'},
    {in: 'oof', out: 'ồ'},
    {in: 'oor', out: 'ổ'},
    {in: 'oox', out: 'ỗ'},
    {in: 'ooj', out: 'ộ'},
    // ă family (aw).
    {in: 'aws', out: 'ắ'},
    {in: 'awf', out: 'ằ'},
    {in: 'awr', out: 'ẳ'},
    {in: 'awx', out: 'ẵ'},
    {in: 'awj', out: 'ặ'},
    // ơ family (ow).
    {in: 'ows', out: 'ớ'},
    {in: 'owf', out: 'ờ'},
    {in: 'owr', out: 'ở'},
    {in: 'owx', out: 'ỡ'},
    {in: 'owj', out: 'ợ'},
    // ư family (uw).
    {in: 'uws', out: 'ứ'},
    {in: 'uwf', out: 'ừ'},
    {in: 'uwr', out: 'ử'},
    {in: 'uwx', out: 'ữ'},
    {in: 'uwj', out: 'ự'},

    // Digraphs: modifier letters.
    {in: 'aa', out: 'â'},
    {in: 'ee', out: 'ê'},
    {in: 'oo', out: 'ô'},
    {in: 'aw', out: 'ă'},
    {in: 'ow', out: 'ơ'},
    {in: 'uw', out: 'ư'},
    {in: 'dd', out: 'đ'},

    // Digraphs: bare-vowel + tone.
    {in: 'as', out: 'á'},
    {in: 'af', out: 'à'},
    {in: 'ar', out: 'ả'},
    {in: 'ax', out: 'ã'},
    {in: 'aj', out: 'ạ'},
    {in: 'es', out: 'é'},
    {in: 'ef', out: 'è'},
    {in: 'er', out: 'ẻ'},
    {in: 'ex', out: 'ẽ'},
    {in: 'ej', out: 'ẹ'},
    {in: 'is', out: 'í'},
    {in: 'if', out: 'ì'},
    {in: 'ir', out: 'ỉ'},
    {in: 'ix', out: 'ĩ'},
    {in: 'ij', out: 'ị'},
    {in: 'os', out: 'ó'},
    {in: 'of', out: 'ò'},
    {in: 'or', out: 'ỏ'},
    {in: 'ox', out: 'õ'},
    {in: 'oj', out: 'ọ'},
    {in: 'us', out: 'ú'},
    {in: 'uf', out: 'ù'},
    {in: 'ur', out: 'ủ'},
    {in: 'ux', out: 'ũ'},
    {in: 'uj', out: 'ụ'},
    {in: 'ys', out: 'ý'},
    {in: 'yf', out: 'ỳ'},
    {in: 'yr', out: 'ỷ'},
    {in: 'yx', out: 'ỹ'},
    {in: 'yj', out: 'ỵ'},
  ],
};
