import { wordWrap } from '../util/wordWrap';
import {TsNode} from './types';
import {TAB, isSimpleType, normalizeKey} from './util';

const formatComment = (comment: string | undefined, __: string): string => {
  if (!comment) return '';
  const lines = wordWrap(comment, {width: 80 - 3 - __.length});
  return __ + '/**\n' + __ + ' * ' + lines.join('\n' + __ + ' * ') + '\n' + __ + ' */\n';
};

export const toText = (node: TsNode | TsNode[], __: string = ''): string => {
  if (Array.isArray(node)) return node.map((s) => toText(s, __)).join('\n');

  const ____ = __ + TAB;

  switch (node.node) {
    case 'ModuleDeclaration': {
      let out: string = '';
      out += `${__}export namespace ${node.name} {\n`;
      out += toText(node.statements, ____);
      out += `${__}}\n`;
      return out;
    }
    case 'InterfaceDeclaration': {
      const {name, members, comment} = node;
      let out: string = '';
      out += formatComment(comment, __);
      out += `${__}export interface ${name} {\n`;
      out += toText(members, ____);
      out += `\n${__}}\n`;
      return out;
    }
    case 'PropertySignature': {
      const name = normalizeKey(node.name);
      return `${__}${name}${node.optional ? '?' : ''}: ${toText(node.type, __)};`;
    }
    case 'IndexSignature': {
      return `${__}[key: string]: ${toText(node.type, __)};`;
    }
    case 'TypeAliasDeclaration': {
      let out: string = '';
      out += formatComment(node.comment, __);
      out += `${__}export type ${node.name} = ${toText(node.type)};\n`;
      return out;
    }
    case 'ArrayType': {
      const simple = isSimpleType(node.elementType);
      const inner = toText(node.elementType, ____);
      return simple ? `${inner}[]` : `Array<${inner}>`;
    }
    case 'StringKeyword': {
      return 'string';
    }
    case 'NumberKeyword': {
      return 'number';
    }
    case 'BooleanKeyword': {
      return 'boolean';
    }
    case 'NullKeyword': {
      return 'null';
    }
    case 'AnyKeyword': {
      return 'any';
    }
    case 'UnknownKeyword': {
      return 'unknown';
    }
    case 'TypeLiteral': {
      return `{\n${toText(node.members, ____)}\n${__}}`;
    }
    case 'StringLiteral': {
      return JSON.stringify(node.text);
    }
    case 'NumericLiteral': {
      return node.text;
    }
    case 'TrueKeyword': {
      return 'true';
    }
    case 'FalseKeyword': {
      return 'false';
    }
    case 'UnionType': {
      return node.types.map((t) => toText(t, ____)).join(' | ');
    }
    case 'TypeReference': {
      return node.typeName;
    }
  }

  return '';
};
