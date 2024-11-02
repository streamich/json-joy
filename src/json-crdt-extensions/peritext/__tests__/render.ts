import type {Block} from '../block/Block';
import type {Inline} from '../block/Inline';
import {LeafBlock} from '../block/LeafBlock';
import {stringify} from '../../../json-text/stringify';

const renderInline = (inline: Inline, tab: string): string => {
  const text = stringify(inline.text());
  const attr: any = {};
  const attributes = inline.attr();
  for (const key in attributes) attr[key] = attributes[key].map((a) => a.slice.data());
  return `${tab}${text} ${stringify(attr)}\n`;
};

const renderBlockHeader = (block: Block, tab: string, hash?: boolean): string => {
  const attr = block.attr();
  const attrStr = attr ? ' ' + stringify(attr) : '';
  const tag = `<${block.tag()}>`;
  const hashStr = hash ? ` #${block.hash.toString(36).slice(-3)}` : '';
  return tab + tag + attrStr + hashStr + '\n';
};

const renderLeafBlock = (block: LeafBlock, tab: string = '', hash?: boolean): string => {
  let str = '';
  str += renderBlockHeader(block, tab, hash);
  const texts = block.texts();
  for (const inline of texts) {
    str += renderInline(inline, tab + '  ');
  }
  return str;
};

const renderBlock = (block: Block, tab: string, hash?: boolean): string => {
  let str = '';
  str += renderBlockHeader(block, tab, hash);
  for (const b of block.children) {
    str += render(b, tab + '  ', hash);
  }
  return str;
};

export const render = (block: Block, tab: string = '', hash?: boolean): string => {
  if (block instanceof LeafBlock) return renderLeafBlock(block, tab, hash);
  else return renderBlock(block, tab, hash);
};
