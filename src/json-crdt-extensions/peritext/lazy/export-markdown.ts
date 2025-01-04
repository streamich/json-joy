import {toHast} from './export-html';
import {toMdast as _toMdast} from 'very-small-parser/lib/html/toMdast';
import {toText as _toMarkdown} from 'very-small-parser/lib/markdown/block/toText';
import type {IRoot} from 'very-small-parser/lib/markdown/block/types';
import type {PeritextMlNode} from '../block/types';

export const toMdast = (json: PeritextMlNode): IRoot => {
  const hast = toHast(json);
  const mdast = _toMdast(hast) as IRoot;
  return mdast;
};

export const toMarkdown = (json: PeritextMlNode): string => _toMarkdown(toMdast(json));
