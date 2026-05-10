import type {TranslitScheme} from '../types';

/**
 * Armenian (Eastern) translit, phonetic 1:1. Letter set chosen to match
 * common Internet conventions; the OW digraph (ո + ւ) is emitted as a
 * two-codepoint sequence.
 */
export const hyTranslit: TranslitScheme = {
  id: 'hy-translit',
  name: 'Armenian (translit)',
  short: 'HY',
  language: 'hy',
  script: 'Armn',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'th', out: 'թ'},
    {in: 'zh', out: 'ժ'},
    {in: 'kh', out: 'խ'},
    {in: 'ts', out: 'ծ'},
    {in: 'dz', out: 'ձ'},
    {in: 'gh', out: 'ղ'},
    {in: 'ch', out: 'ճ'},
    {in: 'sh', out: 'շ'},
    {in: 'ph', out: 'փ'},
    {in: 'ow', out: 'ու'},

    // Single chars.
    {in: 'a', out: 'ա'},
    {in: 'b', out: 'բ'},
    {in: 'g', out: 'գ'},
    {in: 'd', out: 'դ'},
    {in: 'e', out: 'ե'},
    {in: 'z', out: 'զ'},
    {in: 'i', out: 'ի'},
    {in: 'l', out: 'լ'},
    {in: 'k', out: 'կ'},
    {in: 'h', out: 'հ'},
    {in: 'm', out: 'մ'},
    {in: 'y', out: 'յ'},
    {in: 'n', out: 'ն'},
    {in: 'o', out: 'ո'},
    {in: 'p', out: 'պ'},
    {in: 'j', out: 'ջ'},
    {in: 'r', out: 'ր'},
    {in: 's', out: 'ս'},
    {in: 'v', out: 'վ'},
    {in: 't', out: 'տ'},
    {in: 'c', out: 'ց'},
    {in: 'u', out: 'ու'},
    {in: 'q', out: 'ք'},
    {in: 'f', out: 'ֆ'},
  ],
};
