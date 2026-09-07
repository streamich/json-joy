import * as lines from '../../lines';
import {hunks} from '../hunks';
import {Hunk, HunkLine, HUNK_OP_TYPE} from '../types';
import {unified, unifiedHunks} from '../unified';
import {diff, text} from './util';

const seq = (n: number): string[] => Array.from({length: n}, (_, i) => String(i + 1));
const labels = {oldName: 'a', newName: 'b'};
const write = (a: string, b: string, opts?: object): string => {
  const {src, dst, patch, opts: eol} = diff(a, b);
  return text(unified(src, dst, patch, {...labels, ...eol, ...opts}));
};

describe('unified()', () => {
  test('identical files yield nothing, not even a header', () => {
    expect(write('a\nb\n', 'a\nb\n')).toBe('');
    expect(write('', '')).toBe('');
  });

  test('an insertion, with three lines of context', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('--- a\n+++ b\n@@ -1,6 +1,7 @@\n 1\n 2\n 3\n+X\n 4\n 5\n 6\n');
  });

  test('the same insertion at -U0, numbering the line before it', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst, {context: 0})).toBe('--- a\n+++ b\n@@ -3,0 +4 @@\n+X\n');
  });

  test('a deletion at -U0', () => {
    const src = ['1', '2', '3', 'X', '4'].join('\n') + '\n';
    const dst = ['1', '2', '3', '4'].join('\n') + '\n';
    expect(write(src, dst, {context: 0})).toBe('--- a\n+++ b\n@@ -4 +3,0 @@\n-X\n');
  });

  test('a two-for-three change', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'P', 'Q', 'R', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst, {context: 0})).toBe('--- a\n+++ b\n@@ -4,2 +4,3 @@\n-4\n-5\n+P\n+Q\n+R\n');
    expect(write(src, dst)).toBe('--- a\n+++ b\n@@ -1,8 +1,9 @@\n 1\n 2\n 3\n-4\n-5\n+P\n+Q\n+R\n 6\n 7\n 8\n');
  });

  test('a file created from nothing', () => {
    expect(write('', 'a\nb\nc\n')).toBe('--- a\n+++ b\n@@ -0,0 +1,3 @@\n+a\n+b\n+c\n');
  });

  test('a file emptied', () => {
    expect(write('a\nb\nc\n', '')).toBe('--- a\n+++ b\n@@ -1,3 +0,0 @@\n-a\n-b\n-c\n');
  });

  test('single-line ranges omit the count', () => {
    const src = seq(15).join('\n') + '\n';
    const dst = ['X', ...seq(15).slice(1)].join('\n') + '\n';
    expect(write(src, dst, {context: 0})).toBe('--- a\n+++ b\n@@ -1 +1 @@\n-1\n+X\n');
  });

  test('two changes exactly 2*context apart merge into one hunk', () => {
    const src = seq(15);
    const dst = [...src];
    dst[0] = 'X';
    dst[7] = 'Y';
    const out = write(src.join('\n') + '\n', dst.join('\n') + '\n');
    expect(out).toBe('--- a\n+++ b\n@@ -1,11 +1,11 @@\n-1\n+X\n 2\n 3\n 4\n 5\n 6\n 7\n-8\n+Y\n 9\n 10\n 11\n');
  });

  test('one line further apart they stay separate', () => {
    const src = seq(15);
    const dst = [...src];
    dst[0] = 'X';
    dst[8] = 'Y';
    const out = write(src.join('\n') + '\n', dst.join('\n') + '\n');
    expect(out).toBe(
      '--- a\n+++ b\n@@ -1,4 +1,4 @@\n-1\n+X\n 2\n 3\n 4\n@@ -6,7 +6,7 @@\n 6\n 7\n 8\n-9\n+Y\n 10\n 11\n 12\n',
    );
  });

  describe('no trailing newline', () => {
    test('on the source side only', () => {
      expect(write('a\nb\nc', 'a\nb\nc\n')).toBe(
        '--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n b\n-c\n\\ No newline at end of file\n+c\n',
      );
    });

    test('on both sides', () => {
      expect(write('a\nb\nc', 'a\nb\nz')).toBe(
        '--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n b\n-c\n\\ No newline at end of file\n+z\n\\ No newline at end of file\n',
      );
    });

    test('on a context line', () => {
      expect(write('a\nb\nc', 'x\nb\nc')).toBe(
        '--- a\n+++ b\n@@ -1,3 +1,3 @@\n-a\n+x\n b\n c\n\\ No newline at end of file\n',
      );
    });

    test('at -U0, where the marked line is the whole hunk', () => {
      expect(write('a\nb\nc', 'a\nb\nz', {context: 0})).toBe(
        '--- a\n+++ b\n@@ -3 +3 @@\n-c\n\\ No newline at end of file\n+z\n\\ No newline at end of file\n',
      );
    });
  });

  describe('header', () => {
    test('is omitted when no name is given', () => {
      const {src, dst, patch} = diff('a\n', 'b\n');
      expect(text(unified(src, dst, patch))).toBe('@@ -1 +1 @@\n-a\n+b\n');
    });

    test('carries tab-separated timestamps when supplied', () => {
      const out = write('a\n', 'b\n', {oldTime: '2026-08-05 12:00:00', newTime: '2026-08-05 13:00:00'});
      expect(out.split('\n').slice(0, 2)).toEqual(['--- a\t2026-08-05 12:00:00', '+++ b\t2026-08-05 13:00:00']);
    });

    test('an empty name is a name', () => {
      const {src, dst, patch} = diff('a\n', 'b\n');
      expect(text(unified(src, dst, patch, {oldName: ''}))).toBe('--- \n+++ \n@@ -1 +1 @@\n-a\n+b\n');
    });
  });

  test('a section name goes in the @@ trailer', () => {
    const src = seq(20);
    const dst = [...src];
    dst[9] = 'X';
    const out = text(unified(src, dst, lines.diff(src, dst), {...labels, section: () => 'function f()'}));
    expect(out.split('\n')[2]).toBe('@@ -7,7 +7,7 @@ function f()');
  });

  test('yields one chunk per line', () => {
    const {src, dst, patch} = diff('a\nb\n', 'a\nc\n');
    const chunks = [...unified(src, dst, patch, labels)];
    expect(chunks.every((c) => c.endsWith('\n') && c.indexOf('\n') === c.length - 1)).toBe(true);
  });

  test('unifiedHunks renders hunks assembled by hand', () => {
    const hunk = new Hunk(1, 1, 1, 2, [
      new HunkLine(HUNK_OP_TYPE.DEL, 'a'),
      new HunkLine(HUNK_OP_TYPE.INS, 'b'),
      new HunkLine(HUNK_OP_TYPE.INS, 'c', true),
    ]);
    expect(text(unifiedHunks([hunk], {oldName: 'x', newName: 'y'}))).toBe(
      '--- x\n+++ y\n@@ -1 +1,2 @@\n-a\n+b\n+c\n\\ No newline at end of file\n',
    );
    expect(text(unifiedHunks([]))).toBe('');
  });

  test('renders the same hunks the grouper produced', () => {
    const {src, dst, patch, opts} = diff('a\nb\nc\n', 'a\nx\nc\n');
    const grouped = hunks(src, dst, patch, opts);
    expect(text(unifiedHunks(grouped, labels))).toBe(text(unified(src, dst, patch, {...labels, ...opts})));
  });
});
