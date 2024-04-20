import {wordWrap} from '@jsonjoy.com/util/lib/strings/wordWrap';
import {TsIdentifier, TsNode, TsParameter} from './types';
import {TAB, isSimpleType, normalizeKey} from './util';

const formatComment = (comment: string | undefined, __: string): string => {
  if (!comment) return '';
  const lines = wordWrap(comment, {width: 80 - 3 - __.length});
  return __ + '/**\n' + __ + ' * ' + lines.join('\n' + __ + ' * ') + '\n' + __ + ' */\n';
};

export const toText = (node: TsNode | TsNode[] | TsIdentifier | TsParameter, __: string = ''): string => {
  if (Array.isArray(node)) return node.map((s) => toText(s, __)).join('\n');

  const ____ = __ + TAB;

  switch (node.node) {
    case 'ModuleDeclaration': {
      let out: string = '';
      out += `${__}${node.export ? 'export ' : ''}namespace ${node.name} {\n`;
      out += toText(node.statements, ____);
      out += `${__}}\n`;
      return out;
    }
    case 'InterfaceDeclaration': {
      const {name, members, comment} = node;
      let out: string = '';
      out += formatComment(comment, __);
      out += `${__}${node.export ? 'export ' : ''}interface ${name} {\n`;
      out += toText(members, ____);
      out += `\n${__}}\n`;
      return out;
    }
    case 'TypeAliasDeclaration': {
      let out: string = '';
      out += formatComment(node.comment, __);
      out += `${__}${node.export ? 'export ' : ''}type ${node.name} = ${toText(node.type, __)};\n`;
      return out;
    }
    case 'PropertySignature': {
      const name = normalizeKey(node.name);
      let out: string = '';
      out += formatComment(node.comment, __);
      return out + `${__}${name}${node.optional ? '?' : ''}: ${toText(node.type, __)};`;
    }
    case 'IndexSignature': {
      return `${__}[key: string]: ${toText(node.type, __)};`;
    }
    case 'ArrayType': {
      const simple = isSimpleType(node.elementType);
      const inner = toText(node.elementType, __);
      return simple ? `${inner}[]` : `Array<${inner}>`;
    }
    case 'TupleType': {
      const hasObject = node.elements.some((e) => e.node === 'TypeLiteral');
      if (hasObject) {
        return `[\n${____}${node.elements.map((e) => toText(e, ____)).join(',\n' + ____)}\n${__}]`;
      } else return `[${node.elements.map((e) => toText(e, __)).join(', ')}]`;
    }
    case 'GenericTypeAnnotation': {
      return node.id.name;
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
      return !node.members.length ? '{}' : `{\n${toText(node.members, ____)}\n${__}}`;
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
      return (
        (typeof node.typeName === 'string' ? node.typeName : toText(node.typeName, __)) +
        (node.typeArguments && node.typeArguments.length > 0
          ? `<${node.typeArguments.map((t) => toText(t, __)).join(', ')}>`
          : '')
      );
    }
    case 'Identifier': {
      return node.name;
    }
    case 'FunctionType': {
      const {parameters, type} = node;
      const params = parameters.map((p) => toText(p, __)).join(', ');
      return `(${params}) => ${toText(type, __)}`;
    }
    case 'ObjectKeyword': {
      return 'object';
    }
    case 'Parameter': {
      const {name, type} = node;
      return `${toText(name, __)}: ${toText(type, __)}`;
    }
  }

  return '';
};
