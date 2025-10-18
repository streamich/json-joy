import {t} from '../../..';
import {ValidatorCodegen} from '../../../codegen/validator/ValidatorCodegen';
import {typeToJsonSchema} from '../../../json-schema/converter';
import {validateSchema} from '../../../schema/validate';

test('can use helper functions to define type schema fields', () => {
  const string = t.String();
  expect(string.getSchema()).toEqual({kind: 'str'});
  string.title('My String');
  expect(string.getSchema()).toEqual({kind: 'str', title: 'My String'});
  string.intro('This is a string type');
  expect(string.getSchema()).toEqual({
    kind: 'str',
    title: 'My String',
    intro: 'This is a string type',
  });
  string.description('A detailed description of the string type');
  expect(string.getSchema()).toEqual({
    kind: 'str',
    title: 'My String',
    intro: 'This is a string type',
    description: 'A detailed description of the string type',
  });
  string.min(5);
  expect(string.getSchema()).toEqual({
    kind: 'str',
    title: 'My String',
    intro: 'This is a string type',
    description: 'A detailed description of the string type',
    min: 5,
  });
  string.max(10);
  expect(string.getSchema()).toEqual({
    kind: 'str',
    title: 'My String',
    intro: 'This is a string type',
    description: 'A detailed description of the string type',
    min: 5,
    max: 10,
  });
  string.format('ascii');
  expect(string.getSchema()).toEqual({
    kind: 'str',
    title: 'My String',
    intro: 'This is a string type',
    description: 'A detailed description of the string type',
    min: 5,
    max: 10,
    format: 'ascii',
  });
});

describe('StrType format validation', () => {
  describe('ASCII format', () => {
    const asciiType = t.String({format: 'ascii'});

    test('accepts valid ASCII strings', () => {
      const validator = ValidatorCodegen.get({type: asciiType, errors: 'boolean'});
      expect(validator('hello world')).toBe(false);
      expect(validator('123')).toBe(false);
      expect(validator('!@#$%^&*()')).toBe(false);
      expect(validator('')).toBe(false);
      expect(validator('A')).toBe(false);
      expect(validator(' ')).toBe(false);
    });

    test('rejects non-ASCII strings', () => {
      const validator = ValidatorCodegen.get({type: asciiType, errors: 'boolean'});
      expect(validator('héllo')).toBe(true); // é is not ASCII
      expect(validator('🚀')).toBe(true); // Emoji
      expect(validator('中文')).toBe(true); // Chinese characters
      expect(validator('русский')).toBe(true); // Cyrillic
    });

    test('works with min/max length', () => {
      const type = t.String({format: 'ascii', min: 2, max: 5});
      const validator = ValidatorCodegen.get({type, errors: 'boolean'});

      expect(validator('ab')).toBe(false); // Valid ASCII, correct length
      expect(validator('abcde')).toBe(false); // Valid ASCII, correct length
      expect(validator('a')).toBe(true); // Too short
      expect(validator('abcdef')).toBe(true); // Too long
      expect(validator('ñ')).toBe(true); // Non-ASCII (but would also be too short)
      expect(validator('ñoño')).toBe(true); // Good length, but not ASCII
    });
  });

  describe('UTF-8 format', () => {
    const utf8Type = t.String({format: 'utf8'});

    test('accepts valid UTF-8 strings', () => {
      const validator = ValidatorCodegen.get({type: utf8Type, errors: 'boolean'});
      expect(validator('hello world')).toBe(false);
      expect(validator('héllo')).toBe(false);
      expect(validator('🚀')).toBe(false);
      expect(validator('中文')).toBe(false);
      expect(validator('русский')).toBe(false);
      expect(validator('')).toBe(false);
    });

    test('rejects strings with unpaired surrogates', () => {
      const validator = ValidatorCodegen.get({type: utf8Type, errors: 'boolean'});
      // Create strings with unpaired surrogates
      const highSurrogate = String.fromCharCode(0xd800); // High surrogate without low
      const lowSurrogate = String.fromCharCode(0xdc00); // Low surrogate without high

      expect(validator(highSurrogate)).toBe(true); // Unpaired high surrogate
      expect(validator(lowSurrogate)).toBe(true); // Orphaned low surrogate
      expect(validator('hello' + highSurrogate)).toBe(true); // High surrogate at end
      expect(validator(highSurrogate + lowSurrogate + highSurrogate)).toBe(true); // Unpaired at end
    });

    test('accepts valid surrogate pairs', () => {
      const validator = ValidatorCodegen.get({type: utf8Type, errors: 'boolean'});
      // Valid emoji with surrogate pairs
      expect(validator('👍')).toBe(false); // Valid surrogate pair
      expect(validator('💖')).toBe(false); // Valid surrogate pair
    });
  });

  describe('Backward compatibility with ascii boolean', () => {
    test('ascii: true behaves like format: "ascii"', () => {
      const asciiType = t.String({ascii: true});
      const validator = ValidatorCodegen.get({type: asciiType, errors: 'boolean'});

      expect(validator('hello')).toBe(false); // Valid ASCII
      expect(validator('héllo')).toBe(true); // Non-ASCII
    });

    test('format takes precedence over ascii boolean', () => {
      const type = t.String({format: 'utf8', ascii: true});
      const validator = ValidatorCodegen.get({type, errors: 'boolean'});

      // Should behave as UTF-8 validation, allowing non-ASCII
      expect(validator('héllo')).toBe(false); // Should pass UTF-8 validation
    });
  });

  describe('Schema validation', () => {
    test('validates format values', () => {
      expect(() => validateSchema(t.String({format: 'ascii'}).getSchema())).not.toThrow();
      expect(() => validateSchema(t.String({format: 'utf8'}).getSchema())).not.toThrow();
      expect(() => validateSchema(t.String({format: 'invalid' as any}).getSchema())).toThrow('INVALID_STRING_FORMAT');
    });

    test('validates format and ascii consistency', () => {
      expect(() => validateSchema(t.String({format: 'ascii', ascii: false}).getSchema())).toThrow(
        'FORMAT_ASCII_MISMATCH',
      );
      expect(() => validateSchema(t.String({format: 'ascii', ascii: true}).getSchema())).not.toThrow();
      expect(() => validateSchema(t.String({format: 'utf8', ascii: true}).getSchema())).not.toThrow(); // UTF-8 can have ascii=true
    });
  });

  describe('JSON Schema export', () => {
    test('ASCII format adds pattern', () => {
      const type = t.String({format: 'ascii'});
      const jsonSchema_result = typeToJsonSchema(type);
      expect((jsonSchema_result as any).pattern).toBe('^[\\x00-\\x7F]*$');
    });

    test('UTF-8 format does not add pattern', () => {
      const type = t.String({format: 'utf8'});
      const jsonSchema_result = typeToJsonSchema(type);
      expect((jsonSchema_result as any).pattern).toBeUndefined();
    });

    test('backward compatibility with ascii boolean', () => {
      const type = t.String({ascii: true});
      const jsonSchema_result = typeToJsonSchema(type);
      expect((jsonSchema_result as any).pattern).toBe('^[\\x00-\\x7F]*$');
    });
  });
});
