import {hunks} from '../hunks';
import {normal, normalHunks} from '../normal';
import {Hunk, HunkLine, HUNK_OP_TYPE, type NormalOptions} from '../types';
import {diff, text} from './util';

const seq = (n: number): string[] => Array.from({length: n}, (_, i) => String(i + 1));
const write = (a: string, b: string): string => {
  const {src, dst, patch, opts} = diff(a, b);
  return text(normal(src, dst, patch, opts));
};

describe('normal()', () => {
  test('identical files yield nothing', () => {
    expect(write('a\nb\n', 'a\nb\n')).toBe('');
    expect(write('', '')).toBe('');
  });

  test('an append names the line it follows', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('3a4\n> X\n');
  });

  test('a multi-line append carries a range on the new side only', () => {
    expect(write('a\n', 'a\nx\ny\nz\n')).toBe('1a2,4\n> x\n> y\n> z\n');
  });

  test('a deletion', () => {
    const src = ['1', '2', '3', 'X', '4'].join('\n') + '\n';
    const dst = ['1', '2', '3', '4'].join('\n') + '\n';
    expect(write(src, dst)).toBe('4d3\n< X\n');
  });

  test('a change separates the two sides with ---', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'P', 'Q', 'R', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('4,5c4,6\n< 4\n< 5\n---\n> P\n> Q\n> R\n');
  });

  test('a file created from nothing', () => {
    expect(write('', 'a\nb\nc\n')).toBe('0a1,3\n> a\n> b\n> c\n');
  });

  test('a file emptied', () => {
    expect(write('a\nb\nc\n', '')).toBe('1,3d0\n< a\n< b\n< c\n');
  });

  test('every change run is its own command, whatever the gap', () => {
    const src = seq(15);
    const dst = [...src];
    dst[0] = 'X';
    dst[1] = 'Y';
    dst[7] = 'Z';
    expect(write(src.join('\n') + '\n', dst.join('\n') + '\n')).toBe(
      '1,2c1,2\n< 1\n< 2\n---\n> X\n> Y\n8c8\n< 8\n---\n> Z\n',
    );
  });

  describe('no trailing newline', () => {
    test('on the source side only', () => {
      expect(write('a\nb\nc', 'a\nb\nc\n')).toBe('3c3\n< c\n\\ No newline at end of file\n---\n> c\n');
    });

    test('on both sides', () => {
      expect(write('a\nb\nc', 'a\nb\nz')).toBe(
        '3c3\n< c\n\\ No newline at end of file\n---\n> z\n\\ No newline at end of file\n',
      );
    });

    test('unmarked when the unterminated line is not part of any change', () => {
      expect(write('a\nb\nc', 'x\nb\nc')).toBe('1c1\n< a\n---\n> x\n');
    });
  });

  test('normalHunks renders hunks assembled by hand', () => {
    const hunk = new Hunk(3, 0, 4, 1, [new HunkLine(HUNK_OP_TYPE.INS, 'X')]);
    expect(text(normalHunks([hunk]))).toBe('3a4\n> X\n');
    expect(text(normalHunks([]))).toBe('');
  });

  test('ignores any context a caller smuggles in', () => {
    const {src, dst, patch, opts} = diff('a\nb\nc\n', 'a\nx\nc\n');
    const smuggled = {...opts, context: 5} as NormalOptions;
    expect(text(normal(src, dst, patch, smuggled))).toBe('2c2\n< b\n---\n> x\n');
    expect(hunks(src, dst, patch, {...opts, context: 0})).toHaveLength(1);
  });
});
