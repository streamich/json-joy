/**
 * @param text The line, without its terminator.
 * @param size The tab stop; GNU's `--tabsize`, 8 by default.
 * @param flag Re-emitted after a carriage return that is not the last
 *     character. Omit it for a style that has no separate flag field.
 * @returns `text` itself when nothing in it needs expanding.
 */
export const expandLine = (text: string, size: number, flag?: string): string => {
  const length = text.length;
  let out = '';
  let column = 0;
  for (let i = 0; i < length; i++) {
    const code = text.charCodeAt(i);
    if (code === 0x09) {
      const width = size - (column % size);
      column += width;
      out += ' '.repeat(width);
      continue;
    }
    if (code === 0x08) {
      if (column === 0) continue;
      column--;
      out += text[i];
      continue;
    }
    out += text[i];
    if (code === 0x0d) {
      column = 0;
      if (flag !== undefined && i + 1 < length) out += flag;
    } else if (code >= 0x20 && code <= 0x7e) column++;
  }
  return out;
};

/** The expansion a writer applies, or the identity when `-t` was not asked for. */
export const expander = (tabs: number | undefined, flag?: string): ((text: string) => string) =>
  tabs ? (text: string): string => expandLine(text, tabs, flag) : (text: string): string => text;
