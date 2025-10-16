import {UndEndIterator, type UndEndNext} from '../util/iterator';
import type {JsonMlNode} from './types';

export const walk0 = (node: JsonMlNode): UndEndNext<JsonMlNode> => {
  const stack: JsonMlNode[] = [node];
  return () => {
    const node = stack.pop();
    if (!node) return;
    if (typeof node === 'string') return node;
    for (let i = node.length - 1; i >= 2; i--) stack.push(node[i] as JsonMlNode);
    return node;
  };
};

export const walk = (node: JsonMlNode) => new UndEndIterator(walk0(node));
