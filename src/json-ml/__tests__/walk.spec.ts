import type {JsonMlNode} from '../types';
import {walk} from '../walk';

test('simple text', () => {
  const node: JsonMlNode = 'hello';
  const res = [...walk(node)];
  expect(res).toEqual(['hello']);
});

test('a single node', () => {
  const node: JsonMlNode = ['span', null, 'hello'];
  const res = [...walk(node)];
  expect(res).toEqual([['span', null, 'hello'], 'hello']);
});

test('nested nodes', () => {
  const node: JsonMlNode = ['div', {class: 'test'}, ['span', null, 'hello'], ['p', null, 'world'], '!!!'];
  const res = [...walk(node)];
  expect(res).toEqual([
    ['div', {class: 'test'}, ['span', null, 'hello'], ['p', null, 'world'], '!!!'],
    ['span', null, 'hello'],
    'hello',
    ['p', null, 'world'],
    'world',
    '!!!',
  ]);
});
