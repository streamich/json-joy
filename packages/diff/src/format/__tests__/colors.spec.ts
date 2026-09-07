import {contextHunks} from '../context';
import {hunks} from '../hunks';
import {normalHunks} from '../normal';
import {type DiffColors, Hunk, HunkLine, HUNK_OP_TYPE} from '../types';
import {unifiedHunks} from '../unified';
import {diff, text} from './util';

const COLORS: DiffColors = {
  header: '\x1b[1m',
  line: '\x1b[36m',
  add: '\x1b[32m',
  del: '\x1b[31m',
  reset: '\x1b[0m',
};

const labels = {oldName: 'X', newName: 'Y'};

const group = (a: string, b: string, context = 3) => {
  const {src, dst, patch, opts} = diff(a, b);
  return hunks(src, dst, patch, {...opts, context});
};

describe('normalHunks()', () => {
  test('paints the command line, the deletions and the insertions', () => {
    const out = text(normalHunks(group('x\n', 'y\n', 0), {colors: COLORS}));
    expect(out).toBe('\x1b[36m1c1\x1b[0m\n\x1b[31m< x\x1b[0m\n---\n\x1b[32m> y\x1b[0m\n');
  });

  test('leaves the `---` separator and the no-newline marker plain', () => {
    const out = text(normalHunks(group('a\nb', 'a\nB', 0), {colors: COLORS}));
    expect(out).toBe(
      '\x1b[36m2c2\x1b[0m\n' +
        '\x1b[31m< b\x1b[0m\n' +
        '\\ No newline at end of file\n' +
        '---\n' +
        '\x1b[32m> B\x1b[0m\n' +
        '\\ No newline at end of file\n',
    );
  });

  test('no palette is the byte-for-byte output it was before', () => {
    expect(text(normalHunks(group('x\n', 'y\n', 0)))).toBe('1c1\n< x\n---\n> y\n');
    expect(text(normalHunks(group('x\n', 'y\n', 0), {}))).toBe('1c1\n< x\n---\n> y\n');
  });
});

describe('unifiedHunks()', () => {
  test('paints the two header lines, the `@@` line and the changed lines only', () => {
    const out = text(unifiedHunks(group('a\nx\nb\n', 'a\ny\nb\n'), {...labels, colors: COLORS}));
    expect(out).toBe(
      '\x1b[1m--- X\x1b[0m\n' +
        '\x1b[1m+++ Y\x1b[0m\n' +
        '\x1b[36m@@ -1,3 +1,3 @@\x1b[0m\n' +
        ' a\n' +
        '\x1b[31m-x\x1b[0m\n' +
        '\x1b[32m+y\x1b[0m\n' +
        ' b\n',
    );
  });

  test('the header timestamp is inside the paint', () => {
    const out = text(unifiedHunks(group('x\n', 'y\n'), {...labels, oldTime: 'T1', newTime: 'T2', colors: COLORS}));
    expect(out.split('\n')[0]).toBe('\x1b[1m--- X\tT1\x1b[0m');
  });

  test('a `-p` trailer sits outside the paint, after the reset', () => {
    const hunk = new Hunk(1, 1, 1, 1, [new HunkLine(HUNK_OP_TYPE.DEL, 'x'), new HunkLine(HUNK_OP_TYPE.INS, 'y')], 'fn');
    expect(text(unifiedHunks([hunk], {colors: COLORS}))).toBe(
      '\x1b[36m@@ -1 +1 @@\x1b[0m fn\n\x1b[31m-x\x1b[0m\n\x1b[32m+y\x1b[0m\n',
    );
  });
});

describe('contextHunks()', () => {
  test('paints each whole block, context lines included', () => {
    const out = text(contextHunks(group('a\nb\nc\n', 'a\nB\nc\n'), {...labels, colors: COLORS}));
    expect(out).toBe(
      '\x1b[1m*** X\x1b[0m\n' +
        '\x1b[1m--- Y\x1b[0m\n' +
        '***************\n' +
        '\x1b[36m*** 1,3 ****\x1b[0m\n' +
        '\x1b[31m  a\x1b[0m\n' +
        '\x1b[31m! b\x1b[0m\n' +
        '\x1b[31m  c\x1b[0m\n' +
        '\x1b[36m--- 1,3 ----\x1b[0m\n' +
        '\x1b[32m  a\x1b[0m\n' +
        '\x1b[32m! B\x1b[0m\n' +
        '\x1b[32m  c\x1b[0m\n',
    );
  });

  test('the `***************` separator and its trailer stay plain', () => {
    const hunk = new Hunk(1, 1, 1, 1, [new HunkLine(HUNK_OP_TYPE.DEL, 'x'), new HunkLine(HUNK_OP_TYPE.INS, 'y')], 'fn');
    expect(text(contextHunks([hunk], {colors: COLORS}))).toBe(
      '*************** fn\n' +
        '\x1b[36m*** 1 ****\x1b[0m\n' +
        '\x1b[31m! x\x1b[0m\n' +
        '\x1b[36m--- 1 ----\x1b[0m\n' +
        '\x1b[32m! y\x1b[0m\n',
    );
  });
});

describe('a partial palette', () => {
  test('a named field paints and an unnamed one does not', () => {
    const out = text(normalHunks(group('x\n', 'y\n', 0), {colors: {del: '<i>', reset: '</i>'}}));
    expect(out).toBe('1c1\n<i>< x</i>\n---\n> y\n');
  });

  test('without a reset the open string is still written', () => {
    const out = text(normalHunks(group('x\n', 'y\n', 0), {colors: {add: '+'}}));
    expect(out).toBe('1c1\n< x\n---\n+> y\n');
  });
});

describe('an empty section', () => {
  const hunk = new Hunk(1, 1, 1, 1, [new HunkLine(HUNK_OP_TYPE.DEL, 'x'), new HunkLine(HUNK_OP_TYPE.INS, 'y')], '');

  test('prints its space in unified format', () => {
    expect(text(unifiedHunks([hunk])).split('\n')[0]).toBe('@@ -1 +1 @@ ');
  });

  test('prints its space in context format', () => {
    expect(text(contextHunks([hunk])).split('\n')[0]).toBe('*************** ');
  });

  test('an absent section prints none', () => {
    const bare = new Hunk(1, 1, 1, 1, hunk.lines);
    expect(text(unifiedHunks([bare])).split('\n')[0]).toBe('@@ -1 +1 @@');
    expect(text(contextHunks([bare])).split('\n')[0]).toBe('***************');
  });
});
