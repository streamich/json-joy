import {proxy} from '../proxy';

describe('proxy()', () => {
  test('can collect path steps', () => {
    const path = () => proxy((path) => path);

    expect(path().a()).toEqual(['a']);
    expect(path().a.b()).toEqual(['a', 'b']);
    expect(path().a.b[2]()).toEqual(['a', 'b', '2']);
    expect(path().a.b[2].c()).toEqual(['a', 'b', '2', 'c']);
    expect(path().a.b[2].c['d😎']()).toEqual(['a', 'b', '2', 'c', 'd😎']);
  });

  test('can provide arguments', () => {
    const path = () => proxy((path, separator: string) => path.join(separator));

    expect(path().a('.')).toBe('a');
    expect(path().a.b('.')).toBe('a.b');
    expect(path().a.b[2]('.')).toBe('a.b.2');
    expect(path().a.b[2].c('.')).toBe('a.b.2.c');
    expect(path().a.b[2].c['d😎']('.')).toBe('a.b.2.c.d😎');
  });

  test('can provide 2 arguments', () => {
    const path = () => proxy((path, separator: string, suffix: string) => path.join(separator) + suffix);

    expect(path().a('.', '!')).toBe('a!');
    expect(path().a.b('.', '!')).toBe('a.b!');
    expect(path().a.b[2]('.', '!')).toBe('a.b.2!');
    expect(path().a.b[2].c('.', '!')).toBe('a.b.2.c!');
    expect(path().a.b[2].c['d😎']('.', '!')).toBe('a.b.2.c.d😎!');
  });

  test('can provide custom API', () => {
    const path = () => proxy((path) => ({
      join: () => path.join('.'),
    }));

    expect(path().a.b[2].c().join()).toBe('a.b.2.c');
  });
});
