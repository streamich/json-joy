import {normalize, mod} from '../util';

describe('normalize()', () => {
  describe('modifier aliases', () => {
    test('ctrl', () => expect(normalize('ctrl+s')).toBe('Control+s'));
    test('control', () => expect(normalize('control+s')).toBe('Control+s'));
    test('alt', () => expect(normalize('alt+f')).toBe('Alt+f'));
    test('option', () => expect(normalize('option+f')).toBe('Alt+f'));
    test('meta', () => expect(normalize('meta+s')).toBe('Meta+s'));
    test('command', () => expect(normalize('command+s')).toBe('Meta+s'));
    test('cmd', () => expect(normalize('cmd+s')).toBe('Meta+s'));
    test('shift', () => expect(normalize('shift+a')).toBe('Shift+a'));
    test('Primary', () => expect(normalize('Primary+s')).toBe(`${mod}+s`));
    test('p (alias for Primary)', () => expect(normalize('p+s')).toBe(`${mod}+s`));
  });

  describe('case insensitivity for aliases', () => {
    test('Ctrl+Shift+A', () => expect(normalize('Ctrl+Shift+A')).toBe('Control+Shift+a'));
    test('META+S', () => expect(normalize('META+S')).toBe('Meta+s'));
    test('Command+Shift+K', () => expect(normalize('Command+Shift+K')).toBe('Meta+Shift+k'));
  });

  describe('multiple modifiers sorted canonically (Alt < Control < Meta < Shift)', () => {
    test('Alt+Shift+F5', () => expect(normalize('Alt+Shift+F5')).toBe('Alt+Shift+F5'));
    test('Shift+Ctrl is Control+Shift+, not Shift+Control+', () => expect(normalize('Shift+Ctrl+z')).toBe('Control+Shift+z'));
    test('all four', () => expect(normalize('Alt+Ctrl+Meta+Shift+x')).toBe('Alt+Control+Meta+Shift+x'));
  });

  describe('$mod alias resolves to platform primary', () => {
    test('$mod+S resolves to platform mod', () => {
      expect(normalize('$mod+S')).toBe(`${mod}+s`);
    });
    test('$mod+Shift+k', () => {
      const expected = mod === 'Meta' ? 'Meta+Shift+k' : 'Control+Shift+k';
      expect(normalize('$mod+Shift+k')).toBe(expected);
    });
  });

  describe('key normalisation', () => {
    test('single ASCII letter lowercased', () => expect(normalize('Meta+S')).toBe('Meta+s'));
    test('multi-char key kept as-is', () => expect(normalize('Ctrl+Escape')).toBe('Control+Escape'));
    test('function key preserved', () => expect(normalize('Shift+F5')).toBe('Shift+F5'));
    test('bare letter with no modifiers', () => expect(normalize('a')).toBe('a'));
    test('bare special key', () => expect(normalize('Escape')).toBe('Escape'));
    test('arrow key', () => expect(normalize('Ctrl+ArrowUp')).toBe('Control+ArrowUp'));
  });
});
