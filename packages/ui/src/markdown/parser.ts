import {block, inline} from 'very-small-parser/lib/markdown';
import {mdastToFlat} from 'mdast-flat';

export const md = (markdown: string) => {
  const mdast = block.parsef(markdown);
  const flat = mdastToFlat(mdast as any);

  return flat;
};

export const mdi = (markdown: string) => {
  const mdast = {
    type: 'root',
    children: inline.parse(markdown),
  };
  const flat = mdastToFlat(mdast as any);

  return flat;
};
