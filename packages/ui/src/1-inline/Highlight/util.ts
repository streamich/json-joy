type PlainText = string;
type Highlight = [string];
type HighlightedText = (PlainText | Highlight)[];

export const normalize = (text: HighlightedText): HighlightedText => {
  const length = text.length;
  if (length < 2) return text;
  let last = text[0];
  const out: HighlightedText = [last];
  for (let i = 1; i < length; i++) {
    const part = text[i];
    const lastIsString = typeof last === 'string';
    const isString = typeof part === 'string';
    if (lastIsString && isString) out[out.length - 1] = last = last + part;
    else if (!lastIsString && !isString) (last as string[])[0] = last[0] + part[0];
    else if (last === ' ' && !isString && out[out.length - 2] && out[out.length - 2] instanceof Array) {
      last = [out[out.length - 2][0] + ' ' + part[0]];
      out[out.length - 2] = last;
      out.pop();
    } else out.push((last = part));
  }

  return out;
};

export const highlight = (text: string, query: string[]): HighlightedText => {
  let highlighted: HighlightedText = [text];
  for (const q of query) {
    if (!q) continue;
    const next: HighlightedText = [];
    for (const h of highlighted) {
      if (typeof h === 'string') next.push(...highlightToken(h, q));
      else next.push(h);
    }
    highlighted = next;
  }
  return highlighted;
};

const highlightToken = (text: string, token: string): HighlightedText => {
  const lowercased = text.toLowerCase();
  const highlighted: HighlightedText = [];
  let index = 0;
  do {
    const curr = lowercased.indexOf(token, index);
    if (curr === -1) {
      highlighted.push(text.slice(index));
      break;
    }
    if (curr > index) highlighted.push(text.slice(index, curr));
    highlighted.push([text.slice(curr, curr + token.length)]);
    index = curr + token.length;
  } while (index < text.length);
  return highlighted;
};

export const highlightFuzzy = (text: string, token: string): HighlightedText => {
  const lowercased = text.toLowerCase();
  const highlighted: HighlightedText = [];
  const length1 = text.length;
  const length2 = token.length;
  if (!length1) return highlighted;
  if (!length2) return [text];
  let char = text[0];
  const isMatch = lowercased[0] === token[0];
  highlighted.push(isMatch ? [char] : char);
  let x = 1;
  let y = isMatch ? 1 : 0;
  let last = highlighted[0];
  let cnt = isMatch ? 1 : 0;
  for (; x < length1 && y < length2; ) {
    char = text[x];
    const isMatch = lowercased[x] === token[y];
    if (isMatch) {
      cnt++;
      x++;
      y++;
      if (last instanceof Array) last[0] = last[0] + char;
      else {
        last = [char];
        highlighted.push(last);
      }
    } else {
      x++;
      if (last instanceof Array) highlighted.push((last = char));
      else {
        last += char;
        highlighted[highlighted.length - 1] = last;
      }
    }
  }
  if (cnt < 2) return [text];
  if (x < text.length) highlighted.push(text.slice(x));
  return highlighted;
};
