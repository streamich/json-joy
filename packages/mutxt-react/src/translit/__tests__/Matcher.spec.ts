import {CompiledScheme, Matcher} from '../Matcher';
import {convert} from '../convert';
import {ruTranslit} from '../schemes/ru-translit';
import type {TranslitScheme} from '../types';

const feed = (m: Matcher, s: string): string => {
  let out = '';
  for (const ch of s) {
    const step = m.feed(ch);
    if (step.replaceTail > 0) out = out.slice(0, out.length - step.replaceTail);
    out += step.emit;
  }
  return out;
};

describe('Matcher (alphabet)', () => {
  describe('Russian translit', () => {
    test.each([
      ['privet', 'привет'],
      ['ya', 'я'],
      ['yu', 'ю'],
      ['yo', 'ё'],
      ['shokolad', 'шоколад'],
      ['shhuka', 'щука'],
      ['chasy', 'часы'],
      ['borshh', 'борщ'],
      ['hello', 'хелло'],
      ['mir', 'мир'],
    ])('convert(%j) === %j', (input, expected) => {
      expect(convert(input, ruTranslit)).toBe(expected);
    });

    test('mixed input with spaces and punctuation', () => {
      expect(convert('privet, mir!', ruTranslit)).toBe('привет, мир!');
    });

    test('case folding — sentence case', () => {
      expect(convert('Privet', ruTranslit)).toBe('Привет');
    });

    test('case folding — multi-char digraph all caps', () => {
      expect(convert('SHOK', ruTranslit)).toBe('ШОК');
    });

    test('eager-commit + extension rewrites in place', () => {
      const m = new Matcher(new CompiledScheme(ruTranslit));

      const s1 = m.feed('s');
      expect(s1).toEqual({replaceTail: 0, emit: 'с', reset: false});
      expect(m.buffer).toBe('s');
      expect(m.lastEmitLen).toBe(1);

      const s2 = m.feed('h');
      expect(s2).toEqual({replaceTail: 1, emit: 'ш', reset: false});
      expect(m.buffer).toBe('sh');
      expect(m.lastEmitLen).toBe(1);

      const s3 = m.feed('h');
      expect(s3).toEqual({replaceTail: 1, emit: 'щ', reset: true});
      expect(m.buffer).toBe('');
    });

    test('eager-commit then non-extending char emits the next one fresh', () => {
      const m = new Matcher(new CompiledScheme(ruTranslit));
      const s1 = m.feed('s');
      expect(s1.emit).toBe('с');
      const s2 = m.feed('a');
      expect(s2).toEqual({replaceTail: 0, emit: 'а', reset: true});
    });

    test('apostrophe maps to soft sign (no case folding)', () => {
      expect(convert("mat'", ruTranslit)).toBe('мать');
    });

    test('non-letter passes through', () => {
      expect(convert('a1b', ruTranslit)).toBe('а1б');
      expect(convert('hello world', ruTranslit)).toBe('хелло wорлд');
    });
  });

  describe('Final forms', () => {
    const greekSubset: TranslitScheme = {
      id: 'el-test',
      name: 'Greek (test)',
      language: 'el',
      script: 'Grek',
      kind: 'alphabet',
      rules: [
        {in: 'a', out: 'α'},
        {in: 's', out: 'σ'},
        {in: 'o', out: 'ο'},
        {in: 'l', out: 'λ'},
        {in: 'g', out: 'γ'},
      ],
      finalForms: {σ: 'ς'},
    };
    test('end-of-input applies final form', () => {
      expect(convert('logos', greekSubset)).toBe('λογος');
    });
    test('mid-string σ stays medial', () => {
      expect(convert('sa', greekSubset)).toBe('σα');
    });
  });

  describe('flushBuffer', () => {
    test('flushes a held prefix', () => {
      const m = new Matcher(new CompiledScheme(ruTranslit));
      const s = m.feed("'");
      expect(s).toEqual({replaceTail: 0, emit: 'ь', reset: false});
      expect(m.buffer).toBe("'");
      const flushed = m.flushBuffer();
      expect(flushed.replaceTail).toBe(1);
      expect(flushed.emit).toBe('ь');
    });
  });

  describe('reset', () => {
    test('clears buffer and lastEmitLen', () => {
      const m = new Matcher(new CompiledScheme(ruTranslit));
      m.feed('s');
      expect(m.buffer).toBe('s');
      m.reset();
      expect(m.buffer).toBe('');
      expect(m.lastEmitLen).toBe(0);
    });
  });
});

describe('convert helper', () => {
  test('round-trip via the helper matches direct feed', () => {
    const compiled = new CompiledScheme(ruTranslit);
    const m = new Matcher(compiled);
    const direct = feed(m, 'privet');
    const flushed = m.flushBuffer();
    const fullDirect = direct.slice(0, direct.length - flushed.replaceTail) + flushed.emit;
    expect(convert('privet', ruTranslit)).toBe(fullDirect);
  });
});
