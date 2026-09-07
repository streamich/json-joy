import {ifdef} from '../ifdef';
import type {IfdefOptions} from '../types';
import {diff, text} from './util';

const LINES: [string, string, string] = ['%l\n', '%l\n', '%l\n'];
const PLAIN: [string, string, string, string] = ['%=', '%<', '%>', '%<%>'];

const write = (a: string, b: string, opts: Partial<IfdefOptions> = {}): string => {
  const {src, dst, patch, opts: eol} = diff(a, b);
  return text(ifdef(src, dst, patch, {groupFormat: PLAIN, lineFormat: LINES, ...eol, ...opts}));
};

const ifdefs = (name: string): [string, string, string, string] => [
  '%=',
  `#ifndef ${name}\n%<#endif /* ! ${name} */\n`,
  `#ifdef ${name}\n%>#endif /* ${name} */\n`,
  `#ifndef ${name}\n%<#else /* ${name} */\n%>#endif /* ${name} */\n`,
];

const A = 'a\nb\nc\n';
const B = 'a\nX\nc\n';

describe('ifdef()', () => {
  test('the plain table rebuilds the first file plus the inserts', () => {
    expect(write(A, B)).toBe('a\nb\nX\nc\n');
  });

  test('identical files print one of them', () => {
    expect(write(A, A)).toBe(A);
    expect(write('', '')).toBe('');
  });

  test('C preprocessor controls, which is all -D is', () => {
    expect(write(A, B, {groupFormat: ifdefs('FOO')})).toBe(
      'a\n#ifndef FOO\nb\n#else /* FOO */\nX\n#endif /* FOO */\nc\n',
    );
    expect(write('a\nc\n', 'a\nb\nc\n', {groupFormat: ifdefs('FOO')})).toBe('a\n#ifdef FOO\nb\n#endif /* FOO */\nc\n');
    expect(write('a\nb\nc\n', 'a\nc\n', {groupFormat: ifdefs('FOO')})).toBe(
      'a\n#ifndef FOO\nb\n#endif /* ! FOO */\nc\n',
    );
  });

  test('%L keeps the newline where %l drops it', () => {
    expect(write(A, B, {lineFormat: ['<%L>', '<%L>', '<%L>']})).toBe('<a\n><b\n><X\n><c\n>');
    expect(write(A, B, {lineFormat: ['<%l>', '<%l>', '<%l>']})).toBe('<a><b><X><c>');
    expect(write('a\nb', 'a\nB', {lineFormat: ['<%L>', '<%L>', '<%L>']})).toBe('<a\n><b><B>');
  });

  test('%dn in a line format is the line own number', () => {
    expect(write(A, B, {lineFormat: ['%dn %l\n', '-%dn %l\n', '+%dn %l\n']})).toBe('1 a\n-2 b\n+2 X\n3 c\n');
  });

  test('every group letter', () => {
    const gfmt = '%dn %de %df %dl %dm|%dN %dE %dF %dL %dM\n';
    expect(write(A, B, {groupFormat: ['', '', '', gfmt]})).toBe('1 1 2 2 3|1 1 2 2 3\n');
  });

  test('a conditional picks an arm, and scans the other', () => {
    expect(write(A, B, {groupFormat: ['', '', '', '%(n=1?one:many)\n']})).toBe('one\n');
    expect(write(A, B, {groupFormat: ['', '', '', '%(n=2?one:many)\n']})).toBe('many\n');
    expect(write(A, B, {groupFormat: ['', '', '', '%(1=1?T:E)%(1=2?T:E)\n']})).toBe('TE\n');
  });

  test('printf flags, widths and radixes', () => {
    expect(write(A, B, {groupFormat: ['', '', '', '[%5df][%-5df][%05df][%.3df][%xf][%Xf][%of]\n']})).toBe(
      '[    2][2    ][00002][002][2][2][2]\n',
    );
  });

  test("%c'C' writes a character literal, octal and all", () => {
    expect(write(A, B, {groupFormat: ['', '', '', "%c'A'%c'\\101'|"]})).toBe('AA|');
    expect(write(A, B, {groupFormat: ['', '', '', "%c'\\n'"]})).toBe("%c'\\n'");
  });

  test('an unparsable spec is written out, not an error', () => {
    expect(write(A, B, {groupFormat: ['', '', '', '%q %z %(bad) %%\n']})).toBe('%q %z %(bad) %\n');
    expect(write(A, B, {lineFormat: ['', '%q%l\n', '']})).toBe('%qb\n');
  });

  test('an empty unchanged format drops the common lines', () => {
    expect(write(A, B, {groupFormat: ['', '%<', '%>', '%<%>']})).toBe('b\nX\n');
  });

  test('tabs expands the line content and nothing else', () => {
    expect(write('\ta\n', '\tb\n', {lineFormat: ['[%l]\n', '[%l]\n', '[%l]\n'], tabs: 4})).toBe('[    a]\n[    b]\n');
  });
});
