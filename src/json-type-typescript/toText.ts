import {TsNode} from "./types";

const TAB = '  ';

const normalizeKey = (prop: string): string =>
  /^[a-z_][a-z_0-9]*$/i.test(prop) ? prop : JSON.stringify(prop);

const isSimpleType = ({node}: TsNode): boolean =>
  (node === 'NumberKeyword') || (node === 'StringKeyword') || (node === 'BooleanKeyword');


export const toText = (node: TsNode | TsNode[], __: string = ''): string => {
  if (Array.isArray(node)) return node.map(s => toText(s, __)).join('\n');

  const ____ = __ + TAB;
  let out: string = '';

  switch (node.node) {
    case 'ModuleDeclaration': {
      out += `${__}export namespace ${node.name} {\n`;
      out += toText(node.statements, ____);
      out += `${__}}\n`;
      break;
    }
    case 'InterfaceDeclaration': {
      const {name, members} = node;
      out += `${__}export interface ${name} {\n`;
      for (const member of members) out += toText(member, ____);
      out += `${__}}\n`;
      break;
    }
    case 'PropertySignature': {
      const name = normalizeKey(node.name);
      out += `${__}${name}: ${toText(node.type, ____)};\n`;
      break;
    }
    case 'TypeAliasDeclaration': {
      out += `${__}export type ${node.name} = ${toText(node.type)};\n`;
      break;
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
  }

  return out;
};
