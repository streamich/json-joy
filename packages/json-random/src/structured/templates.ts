import type {Token} from '../string';
import type {StringTemplate, Template} from './types';

export const nil: Template = 'nil';

export const tokensHelloWorld: Token = [
  'list',
  ['pick', 'hello', 'Hello', 'Halo', 'Hi', 'Hey', 'Greetings', 'Salutations'],
  ['pick', '', ','],
  ' ',
  ['pick', 'world', 'World', 'Earth', 'Globe', 'Planet'],
  ['pick', '', '!'],
];

export const tokensObjectKey: Token = [
  'pick',
  ['pick', 'id', 'name', 'type', 'tags', '_id', '.git', '__proto__', ''],
  ['list', ['pick', 'user', 'group', '__system__'], ['pick', '.', ':', '_', '$'], ['pick', 'id', '$namespace', '$']],
];

export const str: StringTemplate = ['str', tokensHelloWorld];
