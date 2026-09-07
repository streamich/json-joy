import {groups as toGroups} from './groups';
import {expander} from './tabs';
import type {LinePatch} from '../line';
import {type Group, type IfdefOptions} from './types';

const letterValue = (group: Group, letter: string): number => {
  let from = group.srcFrom;
  let upto = group.srcUpto;
  const lower = letter >= 'A' && letter <= 'Z' ? letter.toLowerCase() : letter;
  if (lower !== letter) {
    from = group.dstFrom;
    upto = group.dstUpto;
  }
  switch (lower) {
    case 'e':
      return from;
    case 'f':
      return from + 1;
    case 'l':
      return upto;
    case 'm':
      return upto + 1;
    case 'n':
      return upto - from;
  }
  return -1;
};

const digits = (value: number, conversion: string): string => {
  const base = conversion === 'd' ? 10 : conversion === 'o' ? 8 : 16;
  const text = value.toString(base);
  return conversion === 'X' ? text.toUpperCase() : text;
};

/** A `%[-'0]*[0-9]*(.[0-9]*)?[cdoxX]` spec. */
class Spec {
  constructor(
    /** Index just past the spec, or `-1` when the text at hand is not one. */
    public readonly end: number,
    /** What it produced, empty when {@link end} is `-1`. */
    public readonly text: string = '',
  ) {}
}

const printfSpec = (format: string, at: number, value: (letter: string) => number): Spec => {
  const length = format.length;
  let i = at + 1;
  while (i < length && (format[i] === '-' || format[i] === "'" || format[i] === '0')) i++;
  const flags = format.slice(at + 1, i);
  const zero = flags.includes('0');
  const left = flags.includes('-');
  let width = 0;
  while (i < length && format[i] >= '0' && format[i] <= '9') width = width * 10 + Number(format[i++]);
  let precision = -1;
  if (format[i] === '.') {
    i++;
    precision = 0;
    while (i < length && format[i] >= '0' && format[i] <= '9') precision = precision * 10 + Number(format[i++]);
  }
  const conversion = format[i++];
  const letter = format[i++];
  if (conversion === 'c') {
    if (letter !== "'") return new Spec(-1);
    let c = format[i++];
    if (c === undefined || c === "'") return new Spec(-1);
    if (c === '\\') {
      let code = 0;
      let count = 0;
      while ((c = format[i++]) !== "'") {
        const digit = c === undefined ? 8 : c.charCodeAt(0) - 0x30;
        if (digit < 0 || digit >= 8) return new Spec(-1);
        code = 8 * code + digit;
        count++;
      }
      if (count < 1 || count > 3) return new Spec(-1);
      return new Spec(i, String.fromCharCode(code & 0xff));
    }
    if (format[i++] !== "'") return new Spec(-1);
    return new Spec(i, c);
  }
  if (conversion !== 'd' && conversion !== 'o' && conversion !== 'x' && conversion !== 'X') return new Spec(-1);
  if (letter === undefined) return new Spec(-1);
  const number = value(letter);
  if (number < 0) return new Spec(-1);
  let text = digits(number, conversion);
  if (precision >= 0) {
    while (text.length < precision) text = '0' + text;
    if (!precision && !number) text = '';
  }
  while (text.length < width) text = left ? text + ' ' : (precision < 0 && zero ? '0' : ' ') + text;
  return new Spec(i, text);
};

const lineGroup = (
  format: string,
  lines: string[],
  from: number,
  upto: number,
  last: number,
  expand: (text: string) => string,
): string => {
  const length = format.length;
  let out = '';
  for (let n = from; n < upto; n++) {
    const text = lines[n];
    const eol = n === last ? '' : '\n';
    for (let i = 0; i < length; i++) {
      const c = format[i];
      if (c !== '%') {
        out += c;
        continue;
      }
      const next = format[i + 1];
      if (next === '%') {
        out += '%';
        i++;
        continue;
      }
      if (next === 'l') {
        out += expand(text);
        i++;
        continue;
      }
      if (next === 'L') {
        out += expand(text) + eol;
        i++;
        continue;
      }
      const spec = printfSpec(format, i, (letter) => (letter === 'n' ? n + 1 : -1));
      if (spec.end < 0) {
        out += '%';
        continue;
      }
      out += spec.text;
      i = spec.end - 1;
    }
  }
  return out;
};

const format = (
  gfmt: string,
  at: number,
  endChar: string,
  group: Group,
  emit: boolean,
  lines: (which: 0 | 1 | 2) => string,
): [text: string, end: number] => {
  const length = gfmt.length;
  let out = '';
  let i = at;
  while (i < length && gfmt[i] !== endChar) {
    const c = gfmt[i++];
    if (c !== '%') {
      if (emit) out += c;
      continue;
    }
    const next = gfmt[i];
    if (next === '%') {
      i++;
      if (emit) out += '%';
      continue;
    }
    if (next === '<' || next === '>' || next === '=') {
      i++;
      if (emit) out += lines(next === '<' ? 1 : next === '>' ? 2 : 0);
      continue;
    }
    if (next === '(') {
      const after = i;
      i++;
      const values: number[] = [];
      let bad = false;
      for (let k = 0; k < 2 && !bad; k++) {
        if (gfmt[i] >= '0' && gfmt[i] <= '9') {
          let number = 0;
          while (i < length && gfmt[i] >= '0' && gfmt[i] <= '9') number = number * 10 + Number(gfmt[i++]);
          values.push(number);
        } else {
          const value = gfmt[i] === undefined ? -1 : letterValue(group, gfmt[i]);
          if (value < 0) bad = true;
          else {
            values.push(value);
            i++;
          }
        }
        if (!bad && gfmt[i++] !== '=?'[k]) bad = true;
      }
      if (bad) {
        if (emit) out += '%';
        i = after;
        continue;
      }
      const taken = values[0] === values[1];
      const [thenText, thenEnd] = format(gfmt, i, ':', group, emit && taken, lines);
      out += thenText;
      i = thenEnd;
      if (i < length) {
        const [elseText, elseEnd] = format(gfmt, i + 1, ')', group, emit && !taken, lines);
        out += elseText;
        i = elseEnd < length ? elseEnd + 1 : elseEnd;
      }
      continue;
    }
    const spec = printfSpec(gfmt, i - 1, (letter) => letterValue(group, letter));
    if (spec.end < 0) {
      if (emit) out += '%';
      continue;
    }
    if (emit) out += spec.text;
    i = spec.end;
  }
  return [out, i];
};

/**
 * Renders {@link groups} as one merged file.
 *
 * @param groups The whole-file tiling.
 * @param src Source lines, no terminators.
 * @param dst Destination lines, no terminators.
 * @param opts The four group formats/options.
 * @returns Chunks of the merged file, one group each.
 */
export function* ifdefGroups(groups: Group[], src: string[], dst: string[], opts: IfdefOptions): Generator<string> {
  const expand = expander(opts.tabs);
  const srcLast = opts.srcNoEol ? src.length - 1 : -1;
  const dstLast = opts.dstNoEol ? dst.length - 1 : -1;
  for (const group of groups) {
    const lines = (which: 0 | 1 | 2): string =>
      which === 2
        ? lineGroup(opts.lineFormat[2], dst, group.dstFrom, group.dstUpto, dstLast, expand)
        : lineGroup(opts.lineFormat[which], src, group.srcFrom, group.srcUpto, srcLast, expand);
    yield format(opts.groupFormat[group.type], 0, '', group, true, lines)[0];
  }
}

/**
 * Serializes a line patch as one merged file, `diff -D`.
 *
 * @param src Source lines, no terminators.
 * @param dst Destination lines, no terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts The group and line formats.
 * @returns Chunks of the merged file, one group each.
 */
export function* ifdef(src: string[], dst: string[], patch: LinePatch, opts: IfdefOptions): Generator<string> {
  yield* ifdefGroups(toGroups(patch, opts), src, dst, opts);
}
