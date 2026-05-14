import type {TranslitScheme} from '../types';

/**
 * Basic ASCII → IPA scheme — handy for linguists who want to type phonetic
 * transcriptions inline. Covers the most common phonemes; uppercase letters
 * map to IPA's "lax" / "open" variants. Use the eo-style fallthrough for
 * letters not listed (b, d, f, h, k, l, m, n, p, s, t, v, w, z all type
 * as their normal Latin glyph and pass through unchanged).
 *
 *   sh → ʃ   zh → ʒ   ch → tʃ   jh → dʒ   ng → ŋ
 *   th → θ   dh → ð   gh → ɣ
 *   A → ɑ   E → ɛ   I → ɪ   O → ɔ   U → ʊ   V → ʌ   N → ɲ
 *   R → ɹ   r → ɾ
 *
 * Long-mark colon (`:`) and stress (`'`) are entered as their Unicode
 * IPA equivalents via single-char rules.
 */
export const ipaTranslit: TranslitScheme = {
  id: 'ipa-translit',
  name: 'IPA (basic)',
  short: 'IPA',
  language: 'und',
  script: 'Latn',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'sh', out: 'ʃ'},
    {in: 'zh', out: 'ʒ'},
    {in: 'ch', out: 'tʃ'},
    {in: 'jh', out: 'dʒ'},
    {in: 'ng', out: 'ŋ'},
    {in: 'th', out: 'θ'},
    {in: 'dh', out: 'ð'},
    {in: 'gh', out: 'ɣ'},

    // Capital-letter (lax / open) vowels and special consonants.
    {in: 'A', out: 'ɑ', caseFold: false},
    {in: 'E', out: 'ɛ', caseFold: false},
    {in: 'I', out: 'ɪ', caseFold: false},
    {in: 'O', out: 'ɔ', caseFold: false},
    {in: 'U', out: 'ʊ', caseFold: false},
    {in: 'V', out: 'ʌ', caseFold: false},
    {in: 'N', out: 'ɲ', caseFold: false},
    {in: 'R', out: 'ɹ', caseFold: false},

    // Single chars. `r` is intentionally NOT remapped so users can type the
    // alveolar /r/ directly; the rhotic approximant `R` (ɹ) and tap (`r̥` for
    // English) are explicit choices.
    {in: 'q', out: 'ʔ', caseFold: false},
    {in: 'y', out: 'j', caseFold: false},
  ],
};
