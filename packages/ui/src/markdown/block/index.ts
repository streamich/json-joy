import type {IMarkdownBlockCodeProps} from './shared';
import Charchem from './Charchem';
import CsvBlock from './Csv/lazy';
import FenBlock from './fen/lazy';
import KatexBlock from './katex/lazy';
import Mathjax from './Mathjax/lazy';
import Jsonld from './jsonld/lazy';

export const blocksByLang: Record<string, React.FC<IMarkdownBlockCodeProps>> = {
  charchem: Charchem,
  jsonld: Jsonld,
  csv: CsvBlock,
  chess: FenBlock,
  fen: FenBlock,
  katex: KatexBlock,
  math: KatexBlock,
  tex: KatexBlock,
  mathjax: Mathjax,
};
