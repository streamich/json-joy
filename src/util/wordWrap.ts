export interface WrapOptions {
  width?: number;
}

const lineMap = (line: string) =>
  line.slice(-1) === '\n' ? line.slice(0, line.length - 1).replace(/[ \t]*$/gm, '') : line;
const lineReduce = (acc: string[], line: string) => {
  acc.push(...line.split('\n'));
  return acc;
};

export const wordWrap = (str: string, options: WrapOptions = {}): string[] => {
  if (!str) return [];

  const width = options.width || 50;
  const regexString = '.{1,' + width + '}([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  const re = new RegExp(regexString, 'g');
  const lines = (str.match(re) || []).map(lineMap).reduce(lineReduce, [] as string[]);

  return lines;
};
