import {toHast} from 'very-small-parser/lib/markdown/block/toHast';
import {block} from 'very-small-parser/lib/markdown/block';
import {fromHast} from './import-html';
import type {IRoot} from 'very-small-parser/lib/markdown/block/types';
import type {PeritextMlNode} from '../block/types';
import type {SliceRegistry} from '../registry/SliceRegistry';

export const fromMdast = (mdast: IRoot, registry: SliceRegistry): PeritextMlNode => {
  const hast = toHast(mdast);
  const node = fromHast(hast, registry);
  return node;
};

export const fromMarkdown = (markdown: string, registry: SliceRegistry): PeritextMlNode => {
  const mdast = block.parsef(markdown);
  return fromMdast(mdast, registry);
};
