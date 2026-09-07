import * as lines from '../../lines';
import {context, contextHunks} from '../context';
import {hunks} from '../hunks';
import {Hunk, HunkLine, HUNK_OP_TYPE} from '../types';
import {diff, text} from './util';

const seq = (n: number): string[] => Array.from({length: n}, (_, i) => String(i + 1));
const labels = {oldName: 'a', newName: 'b'};
const write = (a: string, b: string, opts?: object): string => {
  const {src, dst, patch, opts: eol} = diff(a, b);
  return text(context(src, dst, patch, {...labels, ...eol, ...opts}));
};
const HEAD = '*** a\n--- b\n';
const SEP = '***************\n';

describe('context()', () => {
  test('identical files yield nothing, not even a header', () => {
    expect(write('a\nb\n', 'a\nb\n')).toBe('');
    expect(write('', '')).toBe('');
  });

  test('an insertion omits the old side’s body, keeping its range line', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe(HEAD + SEP + '*** 1,6 ****\n--- 1,7 ----\n  1\n  2\n  3\n+ X\n  4\n  5\n  6\n');
    expect(write(src, dst, {context: 0})).toBe(HEAD + SEP + '*** 3 ****\n--- 4 ----\n+ X\n');
    expect(write(src, dst, {context: 1})).toBe(HEAD + SEP + '*** 3,4 ****\n--- 3,5 ----\n  3\n+ X\n  4\n');
  });

  test('a deletion omits the new side’s body', () => {
    const src = ['1', '2', '3', 'X', '4', '5', '6', '7', '8'].join('\n') + '\n';
    const dst = seq(8).join('\n') + '\n';
    expect(write(src, dst)).toBe(HEAD + SEP + '*** 1,7 ****\n  1\n  2\n  3\n- X\n  4\n  5\n  6\n--- 1,6 ----\n');
    expect(write(src, dst, {context: 0})).toBe(HEAD + SEP + '*** 4 ****\n- X\n--- 3 ----\n');
  });

  test('a changed run is ! on both sides', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'P', 'Q', 'R', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe(
      HEAD +
        SEP +
        '*** 1,8 ****\n  1\n  2\n  3\n! 4\n! 5\n  6\n  7\n  8\n--- 1,9 ----\n  1\n  2\n  3\n! P\n! Q\n! R\n  6\n  7\n  8\n',
    );
    expect(write(src, dst, {context: 0})).toBe(HEAD + SEP + '*** 4,5 ****\n! 4\n! 5\n--- 4,6 ----\n! P\n! Q\n! R\n');
  });

  test('a file created from nothing, and one emptied', () => {
    expect(write('', 'a\nb\nc\n')).toBe(HEAD + SEP + '*** 0 ****\n--- 1,3 ----\n+ a\n+ b\n+ c\n');
    expect(write('a\nb\nc\n', '')).toBe(HEAD + SEP + '*** 1,3 ****\n- a\n- b\n- c\n--- 0 ----\n');
  });

  test('a prepend numbers the line before it, 0 at the start of the file', () => {
    expect(write('1\n2\n', 'X\n1\n2\n', {context: 0})).toBe(HEAD + SEP + '*** 0 ****\n--- 1 ----\n+ X\n');
  });

  test('every hunk gets its own *************** separator', () => {
    const src = seq(15).join('\n') + '\n';
    const dst = ['X', '2', '3', '4', '5', '6', '7', '8', '9', 'Y', '11', '12', '13', '14', '15'].join('\n') + '\n';
    expect(write(src, dst, {context: 0})).toBe(
      HEAD + SEP + '*** 1 ****\n! 1\n--- 1 ----\n! X\n' + SEP + '*** 10 ****\n! 10\n--- 10 ----\n! Y\n',
    );
  });

  describe('! is decided per change run, not per hunk', () => {
    test('a pure deletion and a pure insertion share a hunk as - and +', () => {
      const src = seq(9).join('\n') + '\n';
      const dst = ['1', '3', '4', 'Z', '5', '6', '7', '8', '9'].join('\n') + '\n';
      expect(write(src, dst)).toBe(
        HEAD +
          SEP +
          '*** 1,7 ****\n  1\n- 2\n  3\n  4\n  5\n  6\n  7\n--- 1,7 ----\n  1\n  3\n  4\n+ Z\n  5\n  6\n  7\n',
      );
    });

    test('a changed run and a pure insertion share a hunk as ! and +', () => {
      const src = seq(9).join('\n') + '\n';
      const dst = ['1', 'Q', '3', '4', 'Z', '5', '6', '7', '8', '9'].join('\n') + '\n';
      expect(write(src, dst)).toBe(
        HEAD +
          SEP +
          '*** 1,7 ****\n  1\n! 2\n  3\n  4\n  5\n  6\n  7\n--- 1,8 ----\n  1\n! Q\n  3\n  4\n+ Z\n  5\n  6\n  7\n',
      );
    });
  });

  test('an empty context line still carries its two-space prefix', () => {
    expect(write('a\n\nb\n', 'a\n\nc\n')).toBe(HEAD + SEP + '*** 1,3 ****\n  a\n  \n! b\n--- 1,3 ----\n  a\n  \n! c\n');
  });

  describe('no trailing newline', () => {
    test('on the source side only', () => {
      expect(write('a\nb\nc', 'a\nb\nc\n')).toBe(
        HEAD + SEP + '*** 1,3 ****\n  a\n  b\n! c\n\\ No newline at end of file\n--- 1,3 ----\n  a\n  b\n! c\n',
      );
    });

    test('on both sides', () => {
      expect(write('a\nb\nc', 'a\nb\nz')).toBe(
        HEAD +
          SEP +
          '*** 1,3 ****\n  a\n  b\n! c\n\\ No newline at end of file\n--- 1,3 ----\n  a\n  b\n! z\n\\ No newline at end of file\n',
      );
    });

    test('on the destination side only', () => {
      expect(write('a\nb\nc\n', 'a\nb\nz')).toBe(
        HEAD + SEP + '*** 1,3 ****\n  a\n  b\n! c\n--- 1,3 ----\n  a\n  b\n! z\n\\ No newline at end of file\n',
      );
    });

    test('on a context line, in both sections', () => {
      expect(write('a\nb\nc', 'x\nb\nc')).toBe(
        HEAD +
          SEP +
          '*** 1,3 ****\n! a\n  b\n  c\n\\ No newline at end of file\n--- 1,3 ----\n! x\n  b\n  c\n\\ No newline at end of file\n',
      );
    });

    test('and unmarked at -C0, where that line is outside every hunk', () => {
      expect(write('a\nb\nc', 'x\nb\nc', {context: 0})).toBe(HEAD + SEP + '*** 1 ****\n! a\n--- 1 ----\n! x\n');
    });
  });

  describe('header', () => {
    test('is omitted when no name is given', () => {
      const {src, dst, patch} = diff('a\n', 'b\n');
      expect(text(context(src, dst, patch))).toBe(SEP + '*** 1 ****\n! a\n--- 1 ----\n! b\n');
    });

    test('carries tab-separated timestamps when supplied', () => {
      const out = write('a\n', 'b\n', {oldTime: '2026-08-05 12:00:00', newTime: '2026-08-05 13:00:00'});
      expect(out.split('\n').slice(0, 2)).toEqual(['*** a\t2026-08-05 12:00:00', '--- b\t2026-08-05 13:00:00']);
    });

    test('an empty name is a name', () => {
      const {src, dst, patch} = diff('a\n', 'b\n');
      expect(text(context(src, dst, patch, {oldName: ''}))).toBe(
        '*** \n--- \n' + SEP + '*** 1 ****\n! a\n--- 1 ----\n! b\n',
      );
    });
  });

  test('a section name goes on the separator line', () => {
    const src = seq(20);
    const dst = [...src];
    dst[9] = 'X';
    const out = text(context(src, dst, lines.diff(src, dst), {...labels, section: () => 'int f()'}));
    expect(out.split('\n')[2]).toBe('*************** int f()');
  });

  test('yields one chunk per line', () => {
    const {src, dst, patch} = diff('a\nb\n', 'a\nc\n');
    const chunks = [...context(src, dst, patch, labels)];
    expect(chunks.every((c) => c.endsWith('\n') && c.indexOf('\n') === c.length - 1)).toBe(true);
  });

  test('contextHunks renders hunks assembled by hand', () => {
    const hunk = new Hunk(1, 1, 1, 2, [
      new HunkLine(HUNK_OP_TYPE.DEL, 'a'),
      new HunkLine(HUNK_OP_TYPE.INS, 'b'),
      new HunkLine(HUNK_OP_TYPE.INS, 'c', true),
    ]);
    expect(text(contextHunks([hunk], {oldName: 'x', newName: 'y'}))).toBe(
      '*** x\n--- y\n' + SEP + '*** 1 ****\n! a\n--- 1,2 ----\n! b\n! c\n\\ No newline at end of file\n',
    );
    expect(text(contextHunks([]))).toBe('');
  });

  test('renders the same hunks the grouper produced', () => {
    const {src, dst, patch, opts} = diff('a\nb\nc\n', 'a\nx\nc\n');
    const grouped = hunks(src, dst, patch, opts);
    expect(text(contextHunks(grouped, labels))).toBe(text(context(src, dst, patch, {...labels, ...opts})));
  });
});
