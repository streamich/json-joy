export interface WrapOptions {
  indent?: string;
  width?: number;
  newline?: string;
}

const lineMap = (line: string) => line.slice(-1) === '\n' ? line.slice(0, line.length - 1) : line;

export const wordWrap = (str: string, options: WrapOptions = {}): string => {
  if (!str) return '';

  const width = options.width || 50;
  const indent = options.indent || '';
  const newline = options.newline || '\n' + indent;
  const regexString = '.{1,' + width + '}([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  const re = new RegExp(regexString, 'g');
  const lines = str.match(re) || [];
  const result = indent + lines.map(lineMap).join(newline);

  return result.replace(/[ \t]*$/gm, '');
};
