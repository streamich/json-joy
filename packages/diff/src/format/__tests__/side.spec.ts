import {sideBySide} from '../side';
import {diff, text} from './util';
import type {SideOptions} from '../types';

const write = (a: string, b: string, opts?: SideOptions): string => {
  const {src, dst, patch, opts: eol} = diff(a, b);
  return text(sideBySide(src, dst, patch, {...eol, ...opts}));
};

const columns = (line: string, size = 8): string => {
  let out = '';
  for (const c of line) {
    if (c !== '\t') {
      out += c;
      continue;
    }
    out += ' '.repeat(size - (out.length % size));
  }
  return out;
};

const A = 'a\nb\nc\n';
const B = 'a\nX\nc\n';

describe('sideBySide()', () => {
  test('identical files print, twice over', () => {
    expect(write('a\nb\n', 'a\nb\n')).toBe('a\t\t\t\t\t\t\t\ta\nb\t\t\t\t\t\t\t\tb\n');
    expect(write('', '')).toBe('');
  });

  test('the default geometry puts the gutter at 62 and the right column at 64', () => {
    const line = columns(write(A, B).split('\n')[1]);
    expect(line.indexOf('|')).toBe(62);
    expect(line.indexOf('X')).toBe(64);
  });

  test('expandTabs moves them to 64 and 67, and writes no tab', () => {
    const line = write(A, B, {expandTabs: true}).split('\n')[1];
    expect(line).not.toContain('\t');
    expect(line.indexOf('|')).toBe(64);
    expect(line.indexOf('X')).toBe(67);
  });

  test('a narrow width truncates both halves by print column', () => {
    expect(write('x'.repeat(20) + '\n', 'y'.repeat(20) + '\n', {width: 20})).toBe('xxxxx |\tyyyyy\n');
    expect(write('x'.repeat(20) + '\n', 'y'.repeat(20) + '\n', {width: 20, expandTabs: true})).toBe(
      'xxxxxxxx |  yyyyyyyy\n',
    );
  });

  test('a width too narrow for two columns keeps only the gutter', () => {
    expect(write(A, B, {width: 1})).toBe(' \n|\n \n');
  });

  test('--left-column marks a common line ( and drops its right half', () => {
    const out = write(A, B, {leftColumn: true, expandTabs: true}).split('\n');
    expect(out[0].trimEnd()).toBe('a' + ' '.repeat(63) + '(');
    expect(out[1]).toContain('|');
  });

  test('--suppress-common-lines writes only the rows that differ', () => {
    expect(write(A, B, {suppressCommonLines: true, expandTabs: true}).split('\n').filter(Boolean).length).toBe(1);
    expect(write('a\n', 'a\n', {suppressCommonLines: true})).toBe('');
  });

  test('a one-sided run is > then <', () => {
    const out = write('a\nb\nc\n', 'a\nP\nQ\nc\n', {expandTabs: true, width: 20}).split('\n');
    expect(out[1].trim()).toBe('b        |  P');
    expect(out[2].trim()).toBe('>  Q');
  });

  test('--sdiff-merge-assist counts each run', () => {
    expect(write(A, B, {mergeAssist: true, width: 20})).toBe('i1,1\na\ta\nc1,1\nb     |\tX\ni1,1\nc\tc\n');
  });

  test('a mismatched final newline turns | into / or \\', () => {
    expect(write('a\nb', 'a\nB\n', {width: 20})).toBe('a\ta\nb     \\\tB\n');
    expect(write('a\nb\n', 'a\nB', {width: 20})).toBe('a\ta\nb     /\tB\n');
    expect(write('a\nb', 'a\nB', {width: 20})).toBe('a\ta\nb     |\tB');
  });

  test('an empty right line is not padded to', () => {
    expect(write('a\n\n', 'a\n\n', {width: 20})).toBe('a\ta\n\n');
  });
});
