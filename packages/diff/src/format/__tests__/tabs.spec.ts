import {contextHunks} from '../context';
import {edHunks} from '../ed';
import {hunks} from '../hunks';
import {normalHunks} from '../normal';
import {rcsHunks} from '../rcs';
import {expandLine} from '../tabs';
import {unifiedHunks} from '../unified';
import {diff, text} from './util';

const labels = {oldName: 'X', newName: 'Y'};

const group = (a: string, b: string, context = 3) => {
  const {src, dst, patch, opts} = diff(a, b);
  return hunks(src, dst, patch, {...opts, context});
};

describe('expandLine()', () => {
  test('advances to the next stop, counting from zero', () => {
    expect(expandLine('a\tb\tc', 8)).toBe('a       b       c');
    expect(expandLine('a\tb\tc', 4)).toBe('a   b   c');
    expect(expandLine('a\tb\tc', 1)).toBe('a b c');
    expect(expandLine('\tx', 8)).toBe('        x');
    expect(expandLine('12345678\tx', 8)).toBe('12345678        x');
  });

  test('a line with no tab is returned unchanged', () => {
    expect(expandLine('plain text', 8)).toBe('plain text');
    expect(expandLine('', 8)).toBe('');
  });

  test('a backspace moves the column back and a carriage return resets it', () => {
    expect(expandLine('A\bB\tD', 8)).toBe('A\bB       D');
    expect(expandLine('AAAA\rB\tD', 8)).toBe('AAAA\rB       D');
  });

  test('a backspace with nothing to its left is dropped', () => {
    expect(expandLine('\bA\tD', 8)).toBe('A       D');
    expect(expandLine('\b\bA\tD', 8)).toBe('A       D');
    expect(expandLine('A\b\bB\tD', 8)).toBe('A\bB       D');
    expect(expandLine('A\r\bB\tD', 8)).toBe('A\rB       D');
    expect(expandLine('\b\t', 8)).toBe('        ');
  });

  test('only a printable ASCII byte takes a column', () => {
    // A vertical tab, a form feed, a DEL and a high byte are all zero-width,
    // and every one of them still reaches the output.
    expect(expandLine('A\vB\tD', 8)).toBe('A\vB      D');
    expect(expandLine('A\fB\tD', 8)).toBe('A\fB      D');
    expect(expandLine('A\x7fB\tD', 8)).toBe('A\x7fB      D');
    expect(expandLine('A\x80B\tD', 8)).toBe('A\x80B      D');
    expect(expandLine('A\x01B\tD', 8)).toBe('A\x01B      D');
    expect(expandLine('A\x7eB\tD', 8)).toBe('A\x7eB     D');
  });

  test('a carriage return re-emits the flag it was given, but not at end of line', () => {
    expect(expandLine('A\rB\tD', 8, '< ')).toBe('A\r< B       D');
    expect(expandLine('A\rB\rC', 8, '! ')).toBe('A\r! B\r! C');
    expect(expandLine('A\tB\r', 8, '< ')).toBe('A       B\r');
    expect(expandLine('A\rB\tD', 8)).toBe('A\rB       D');
  });
});

describe('the writers', () => {
  const TABBED = 'a\tb\tc\nX\tY\n';
  const TABBED2 = 'a\tb\tZ\nX\tY\n';

  test('normal format expands and re-emits its `< `/`> ` flag', () => {
    expect(text(normalHunks(group(TABBED, TABBED2, 0), {tabs: 8}))).toBe(
      '1c1\n< a       b       c\n---\n> a       b       Z\n',
    );
    expect(text(normalHunks(group('A\rB\tC\n', 'A\rB\tD\n', 0), {tabs: 8}))).toBe(
      '1c1\n< A\r< B       C\n---\n> A\r> B       D\n',
    );
  });

  test('unified format expands and re-emits nothing', () => {
    expect(text(unifiedHunks(group(TABBED, TABBED2), {...labels, tabs: 8}))).toBe(
      '--- X\n+++ Y\n@@ -1,2 +1,2 @@\n-a       b       c\n+a       b       Z\n X       Y\n',
    );
    expect(text(unifiedHunks(group('A\rB\tC\n', 'A\rB\tD\n'), {...labels, tabs: 8}))).toBe(
      '--- X\n+++ Y\n@@ -1 +1 @@\n-A\rB       C\n+A\rB       D\n',
    );
  });

  test('context format expands and re-emits the two-character prefix', () => {
    expect(text(contextHunks(group('ctx\rZ\nA\rB\tC\n', 'ctx\rZ\nA\rB\tD\n'), {...labels, tabs: 8}))).toBe(
      '*** X\n--- Y\n***************\n' +
        '*** 1,2 ****\n  ctx\r  Z\n! A\r! B       C\n' +
        '--- 1,2 ----\n  ctx\r  Z\n! A\r! B       D\n',
    );
  });

  test('ed and RCS expand with no flag at all', () => {
    expect(text(edHunks(group(TABBED, TABBED2, 0), {tabs: 8}))).toBe('1c\na       b       Z\n.\n');
    expect(text(rcsHunks(group(TABBED, TABBED2, 0), {tabs: 8}))).toBe('d1 1\na1 1\na       b       Z\n');
  });

  test('a header, a `@@` line and a `-p` trailer keep their tabs', () => {
    const out = text(
      unifiedHunks(group(TABBED, TABBED2), {oldName: 'n', newName: 'm', oldTime: 't', newTime: 'u', tabs: 8}),
    );
    expect(out.split('\n').slice(0, 2)).toEqual(['--- n\tt', '+++ m\tu']);
  });

  test('no stop is the byte-for-byte output it was before', () => {
    expect(text(normalHunks(group(TABBED, TABBED2, 0)))).toBe('1c1\n< a\tb\tc\n---\n> a\tb\tZ\n');
    expect(text(normalHunks(group(TABBED, TABBED2, 0), {tabs: 0}))).toBe('1c1\n< a\tb\tc\n---\n> a\tb\tZ\n');
  });
});
