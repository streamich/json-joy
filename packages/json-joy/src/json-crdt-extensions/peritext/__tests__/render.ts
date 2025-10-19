import {LeafBlock} from '../block/LeafBlock';
import {toLine} from 'pojo-dump/lib/toLine';
import type {Block} from '../block/Block';
import type {Inline} from '../block/Inline';

const renderInline = <T>(inline: Inline<T>, tab: string): string => {
  const text = toLine(inline.text());
  const attr: any = {};
  const attributes = inline.attr();
  for (const key in attributes) attr[key] = attributes[key].map((a) => a.slice.data());
  return `${tab}${text} ${toLine(attr)}\n`;
};

const renderBlockHeader = <T>(block: Block<T>, tab: string, hash?: boolean): string => {
  const attr = block.attr();
  const attrStr = attr ? ' ' + toLine(attr) : '';
  const tag = `<${block.tag()}>`;
  const hashStr = hash ? ` #${block.hash.toString(36).slice(-3)}` : '';
  return tab + tag + attrStr + hashStr + '\n';
};

const renderLeafBlock = <T>(block: LeafBlock<T>, tab: string = '', hash?: boolean): string => {
  let str = '';
  str += renderBlockHeader(block, tab, hash);
  const texts = block.texts();
  for (const inline of texts) str += renderInline(inline, tab + '  ');
  return str;
};

const renderBlock = <T>(block: Block<T>, tab: string, hash?: boolean): string => {
  let str = '';
  str += renderBlockHeader(block, tab, hash);
  for (const b of block.children) str += render(b, tab + '  ', hash);
  return str;
};

export const render = <T>(block: Block<T>, tab: string = '', hash?: boolean): string => {
  if (block instanceof LeafBlock) return renderLeafBlock(block, tab, hash);
  else return renderBlock(block, tab, hash);
};
