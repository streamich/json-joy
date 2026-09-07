import {contextHunks} from '../context';
import {forwardEd} from '../ed';
import {hunks} from '../hunks';
import {normalHunks} from '../normal';
import {unifiedHunks} from '../unified';
import {diff, text} from './util';
import type {FlagOptions} from '../types';

const A = 'x\n\ny\n';
const B = 'x\n\nz\n';

const write = (style: 'normal' | 'unified' | 'context', a: string, b: string, opts: FlagOptions = {}): string => {
  const {src, dst, patch, opts: eol} = diff(a, b);
  const all = {...eol, ...opts};
  if (style === 'normal') return text(normalHunks(hunks(src, dst, patch, {...all, context: 0}), all));
  const built = hunks(src, dst, patch, all);
  return text(style === 'unified' ? unifiedHunks(built, all) : contextHunks(built, all));
};

describe('initialTab', () => {
  test('normal format puts the tab where the space was', () => {
    expect(write('normal', A, B)).toBe('3c3\n< y\n---\n> z\n');
    expect(write('normal', A, B, {initialTab: true})).toBe('3c3\n<\ty\n---\n>\tz\n');
  });

  test('unified replaces the context flag and appends to -/+', () => {
    expect(write('unified', A, B, {initialTab: true})).toBe('@@ -1,3 +1,3 @@\n\tx\n\t\n-\ty\n+\tz\n');
  });

  test('context format keeps its two-character field', () => {
    expect(write('context', A, B, {initialTab: true})).toBe(
      '***************\n*** 1,3 ****\n \tx\n \t\n!\ty\n--- 1,3 ----\n \tx\n \t\n!\tz\n',
    );
  });
});

describe('suppressBlankEmpty', () => {
  test('an empty line loses its separator, and the space flag with it', () => {
    expect(write('unified', A, B, {suppressBlankEmpty: true})).toBe('@@ -1,3 +1,3 @@\n x\n\n-y\n+z\n');
    expect(write('context', A, B, {suppressBlankEmpty: true})).toBe(
      '***************\n*** 1,3 ****\n  x\n\n! y\n--- 1,3 ----\n  x\n\n! z\n',
    );
    expect(write('normal', 'a\n\n', 'a\n', {suppressBlankEmpty: true})).toBe('2d1\n<\n');
  });

  test('with initialTab the tab goes too, and only for the empty line', () => {
    expect(write('unified', 'x\n\ny\n', 'x\nX\nz\n', {initialTab: true, suppressBlankEmpty: true})).toBe(
      '@@ -1,3 +1,3 @@\n\tx\n-\n-\ty\n+\tX\n+\tz\n',
    );
  });
});

describe('forwardEd()', () => {
  const script = (a: string, b: string): string => {
    const {src, dst, patch} = diff(a, b);
    return text(forwardEd(src, dst, patch));
  };

  test('commands come out in file order, letter before the range', () => {
    expect(script('a\nb\nc\n', 'a\nX\nc\n')).toBe('c2\nX\n.\n');
    expect(script('a\nb\nc\nd\ne\n', 'a\nB\nc\nd\nE\nF\n')).toBe('c2\nB\n.\nc5\nE\nF\n.\n');
  });

  test('a multi-line range separates its numbers with a space', () => {
    expect(script('a\nb\nc\nd\n', 'a\nd\n')).toBe('d2 3\n');
  });

  test('an append names the line it follows, and a delete carries no text', () => {
    expect(script('a\n', 'a\nb\n')).toBe('a1\nb\n.\n');
    expect(script('a\nb\n', 'b\n')).toBe('d1\n');
  });

  test('identical files yield nothing', () => {
    expect(script('a\nb\n', 'a\nb\n')).toBe('');
  });

  test('a lone dot is written as it stands', () => {
    expect(script('a\n', '.\n')).toBe('c1\n.\n.\n');
  });
});
