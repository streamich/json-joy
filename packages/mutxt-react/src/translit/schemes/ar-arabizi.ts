import type {TranslitScheme} from '../types';

/**
 * Arabic via Arabizi (Arabic chat alphabet). Numerals stand in for Arabic
 * phonemes that have no Latin analogue — `7 → ح`, `3 → ع`, etc. Because the
 * scheme has digit rules, the matcher's `digitsAreLetters` flag turns on
 * automatically and digits become buffer-eligible (otherwise digits would
 * be word boundaries).
 *
 * RTL is handled by the browser's bidi algorithm — the matcher emits
 * standard Arabic codepoints in logical order.
 *
 *   2 → ء   3 → ع   5 → خ   6 → ط   7 → ح   8 → ق   9 → ص
 *   T → ط   D → ض   Z → ظ   S → ص   H → ح   2 stands for hamza.
 */
export const arArabizi: TranslitScheme = {
  id: 'ar-arabizi',
  name: 'Arabic (Arabizi)',
  short: 'AR',
  language: 'ar',
  script: 'Arab',
  direction: 'rtl',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'th', out: 'ث'},
    {in: 'dh', out: 'ذ'},
    {in: 'sh', out: 'ش'},
    {in: 'gh', out: 'غ'},
    {in: 'kh', out: 'خ'},

    // Numerals (Arabizi convention).
    {in: '2', out: 'ء'},
    {in: '3', out: 'ع'},
    {in: '5', out: 'خ'},
    {in: '6', out: 'ط'},
    {in: '7', out: 'ح'},
    {in: '8', out: 'ق'},
    {in: '9', out: 'ص'},

    // Capital-letter overrides for emphatic / pharyngeal phonemes.
    {in: 'T', out: 'ط', caseFold: false},
    {in: 'D', out: 'ض', caseFold: false},
    {in: 'Z', out: 'ظ', caseFold: false},
    {in: 'S', out: 'ص', caseFold: false},
    {in: 'H', out: 'ح', caseFold: false},

    // Long vowels (mater lectionis) via doubled-letter digraphs.
    {in: 'aa', out: 'ا', caseFold: false},
    {in: 'ii', out: 'ي', caseFold: false},
    {in: 'uu', out: 'و', caseFold: false},

    // Short vowels are not written in Arabic — silently absorb.
    {in: 'a', out: '', caseFold: false},
    {in: 'e', out: '', caseFold: false},
    {in: 'i', out: '', caseFold: false},
    {in: 'o', out: '', caseFold: false},
    {in: 'u', out: '', caseFold: false},

    // Consonants.
    {in: 'b', out: 'ب', caseFold: false},
    {in: 't', out: 'ت', caseFold: false},
    {in: 'j', out: 'ج', caseFold: false},
    {in: 'h', out: 'ه', caseFold: false},
    {in: 'd', out: 'د', caseFold: false},
    {in: 'r', out: 'ر', caseFold: false},
    {in: 'z', out: 'ز', caseFold: false},
    {in: 's', out: 'س', caseFold: false},
    {in: 'f', out: 'ف', caseFold: false},
    {in: 'k', out: 'ك', caseFold: false},
    {in: 'l', out: 'ل', caseFold: false},
    {in: 'm', out: 'م', caseFold: false},
    {in: 'n', out: 'ن', caseFold: false},
    {in: 'w', out: 'و', caseFold: false},
    {in: 'y', out: 'ي', caseFold: false},
  ],
};
