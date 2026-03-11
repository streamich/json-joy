import {normalize, mod} from '../util';

describe('normalize()', () => {
  describe('modifier aliases', () => {
    test('ctrl', () => expect(normalize('ctrl+s')).toBe('C+s'));
    test('control', () => expect(normalize('control+s')).toBe('C+s'));
    test('alt', () => expect(normalize('alt+f')).toBe('A+f'));
    test('option', () => expect(normalize('option+f')).toBe('A+f'));
    test('meta', () => expect(normalize('meta+s')).toBe('M+s'));
    test('command', () => expect(normalize('command+s')).toBe('M+s'));
    test('cmd', () => expect(normalize('cmd+s')).toBe('M+s'));
    test('shift', () => expect(normalize('shift+a')).toBe('S+a'));
    test('Primary', () => expect(normalize('Primary+s')).toBe(`${mod}+s`));
    test('p (alias for Primary)', () => expect(normalize('p+s')).toBe(`${mod}+s`));
  });

  describe('case insensitivity for aliases', () => {
    test('Ctrl+Shift+A', () => expect(normalize('Ctrl+Shift+A')).toBe('CS+a'));
    test('META+S', () => expect(normalize('META+S')).toBe('M+s'));
    test('Command+Shift+K', () => expect(normalize('Command+Shift+K')).toBe('MS+k'));
  });

  describe('multiple modifiers sorted canonically (ACMS)', () => {
    test('Alt+Shift+F5', () => expect(normalize('Alt+Shift+F5')).toBe('AS+F5'));
    test('Shift+Ctrl is CS+, not SC+', () => expect(normalize('Shift+Ctrl+z')).toBe('CS+z'));
    test('all four', () => expect(normalize('Alt+Ctrl+Meta+Shift+x')).toBe('ACMS+x'));
  });

  describe('$mod alias resolves to platform primary', () => {
    test('$mod+S resolves to platform mod', () => {
      expect(normalize('$mod+S')).toBe(`${mod}+s`);
    });
    test('$mod+Shift+k', () => {
      const expected = mod === 'M' ? 'MS+k' : 'CS+k';
      expect(normalize('$mod+Shift+k')).toBe(expected);
    });
  });

  describe('key normalisation', () => {
    test('single ASCII letter lowercased', () => expect(normalize('Meta+S')).toBe('M+s'));
    test('multi-char key kept as-is', () => expect(normalize('Ctrl+Escape')).toBe('C+Escape'));
    test('function key preserved', () => expect(normalize('Shift+F5')).toBe('S+F5'));
    test('bare letter with no modifiers', () => expect(normalize('a')).toBe('a'));
    test('bare special key', () => expect(normalize('Escape')).toBe('Escape'));
    test('arrow key', () => expect(normalize('Ctrl+ArrowUp')).toBe('C+ArrowUp'));
  });
});
