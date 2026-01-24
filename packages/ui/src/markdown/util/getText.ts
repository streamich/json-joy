import type {Flat} from 'mdast-flat/lib/types';

const getText = (ast: Flat, idx: number = 0, stopAtLength: number = Infinity): string => {
  let str = '';

  const iterate = (currentIdx: number) => {
    const node = ast.nodes[currentIdx];
    if (typeof node.value === 'string') {
      str += node.value.replace(/\s+/g, ' ');
      return;
    }
    if (node.children instanceof Array) {
      for (const child of node.children) {
        iterate(child as any as number);
        if (str.length >= stopAtLength) return;
      }
    }
  };

  iterate(idx);
  return str;
};

export default getText;
