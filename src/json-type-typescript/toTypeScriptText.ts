import type {Display, TAnyType} from '../json-type';
import wrap from 'word-wrap';
import {normalizeFiledKey} from './util';

const TAB = '  ';

const formatComment = (node: Display, __: string): string => {
  if (node.title || node.description) {
    if (!node.description) {
      return `${__}/** ${node.title} */\n`;
    }
    let res = '';
    res += `${__}/**\n`;
    if (node.title) res += `${__} * # ${node.title}\n`;
    if (node.title && node.description) res += `${__} *\n`;
    if (node.description) {
      const txt = wrap(node.description);
      const lines = txt.split('\n');
      for (const line of lines) {
        res += `${__} * ${line.trim()}\n`;
      }
    }
    res += `${__} */\n`;
    return res;
  }
  return '';
};

export const toTypeScriptText = (type: TAnyType, tab: string): string => {
  if ((type as any).const) {
    return JSON.stringify((type as any).const);
  }
  switch (type.__t) {
    case 'str': {
      return 'string';
    }
    case 'num': {
      return 'number';
    }
    case 'bool': {
      return 'boolean';
    }
    case 'nil': {
      return 'null';
    }
    case 'arr': {
      return `Array<${toTypeScriptText(type.type as TAnyType, tab + TAB)}>`;
    }
    case 'enum': {
      return `[${type.values.map((t) => toTypeScriptText(t as TAnyType, tab + TAB)).join(', ')}]`;
    }
    case 'obj': {
      const ____ = tab + TAB;
      if (type.fields.length === 0) return 'object';
      let res = '{\n';
      for (let i = 0; i < type.fields.length; i++) {
        const field = type.fields[i];
        const key = normalizeFiledKey(field.key) + (field.isOptional ? '?' : '');
        if (i) if (field.key || field.description) res += `\n`;
        res += formatComment(field, ____);
        res += `${____}${key}: ${toTypeScriptText(field.type as TAnyType, ____)};\n`;
      }
      res += tab + '}';
      return res;
    }
    case 'ref': {
      return type.ref;
    }
    case 'or': {
      return type.types.map((t) => toTypeScriptText(t as TAnyType, tab + TAB)).join(' | ');
    }
    case 'bin': {
      return 'Uint8Array';
    }
    case 'any': {
      return 'any';
    }
    default: {
      return 'any';
    }
  }
};
