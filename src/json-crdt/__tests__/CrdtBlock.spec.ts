import {toJson} from '../CrdtBlock';
import {JsonCrdtNode, JsonCrdtNodeTypes} from '../types';

describe('.toJson()', () => {
  test('encodes a null', () => {
    expect(toJson(null)).toBe(null);
  });

  test('encodes booleans', () => {
    expect(toJson(true)).toBe(true);
    expect(toJson(false)).toBe(false);
  });

  test('encodes numbers', () => {
    expect(toJson(0)).toBe(0);
    expect(toJson(1)).toBe(1);
    expect(toJson(-2)).toBe(-2);
    expect(toJson(1.123)).toBe(1.123);
  });

  describe('strings', () => {
    test('encodes an empty string', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.String,
        l: '',
        r: '',
        c: {}
      };
      expect(toJson(node)).toBe('');
    });

    test('encodes a single chunk string', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.String,
        l: 'xyz',
        r: 'xyz',
        c: {
          'xyz': {
            c: 'hello',
          }
        }
      };
      expect(toJson(node)).toBe('hello');
    });
  
    test('encodes a two chunk string', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.String,
        l: 'a',
        r: 'a',
        c: {
          'b': {
            l0: 'a',
            l1: 'a',
            c: 'ma!',
          },
          'a': {
            r0: 'b',
            r1: 'b',
            c: 'Ma',
          },
        }
      };
      expect(toJson(node)).toBe('Mama!');
    });
  
    test('encodes a three chunk string', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.String,
        l: 'a',
        r: 'a',
        c: {
          'b': {
            l0: 'a',
            l1: 'a',
            r0: 'c',
            r1: 'c',
            c: 'ma!',
          },
          'c': {
            l0: 'b',
            l1: 'b',
            c: ' Mia!',
          },
          'a': {
            r0: 'b',
            r1: 'b',
            c: 'Ma',
          },
        }
      };
      expect(toJson(node)).toBe('Mama! Mia!');
    });
  });

  describe('array', () => {
    test('empty array', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.Array,
        l: '',
        r: '',
        c: {}
      };
      expect(toJson(node)).toEqual([]);
    });

    test('encodes a single chunk array', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.Array,
        l: 'xyz',
        r: 'xyz',
        c: {
          'xyz': {
            c: 123,
          }
        }
      };
      expect(toJson(node)).toEqual([123]);
    });

    test('encodes a two chunk array', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.Array,
        l: 'a',
        r: 'a',
        c: {
          'a': {
            r0: 'b',
            r1: 'b',
            c: 123,
          },
          'b': {
            l0: 'a',
            l1: 'a',
            c: true,
          }
        }
      };
      expect(toJson(node)).toEqual([123, true]);
    });

    test('encodes a three chunk array with a complex type', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.Array,
        l: 'a',
        r: 'a',
        c: {
          'a': {
            r0: 'b',
            r1: 'b',
            c: 123,
          },
          'b': {
            l0: 'a',
            l1: 'a',
            r0: 'c',
            r1: 'c',
            c: null,
          },
          'c': {
            l0: 'b',
            l1: 'b',
            c: {
              t: JsonCrdtNodeTypes.Array,
              l: '',
              r: '',
              c: {}
            },
          },
        }
      };
      expect(toJson(node)).toEqual([123, null, []]);
    });
  });

  describe('object', () => {
    test('formats to JSON a basic object', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.Object,
        l: 'id1',
        r: 'id1',
        c: {
          'id1': {
            c: ['foo', {
              t: JsonCrdtNodeTypes.String,
              l: 'id2',
              r: 'id2',
              c: {
                'id2': {
                  c: 'bar',
                }
              }
            }]
          }
        },
      };
      const json = toJson(node);
      expect(json).toEqual({
        foo: 'bar',
      });
    });

    test('nested object', () => {
      const node: JsonCrdtNode = {
        t: JsonCrdtNodeTypes.Object,
        l: 'a',
        r: '',
        c: {
          'a': {
            r0: 'b',
            r1: 'b',
            c: ['foo', {
              t: JsonCrdtNodeTypes.String,
              l: 'id2',
              r: 'id2',
              c: {
                'id2': {
                  c: 'bar',
                }
              }
            }]
          },
          'b': {
            l0: 'a',
            l1: 'a',
            r0: 'c',
            r1: 'c',
            c: ['a', true],
          },
          'c': {
            l0: 'b',
            l1: 'b',
            c: ['aha', {
              t: JsonCrdtNodeTypes.Object,
              l: '',
              r: '',
              c: {},
            }],
          },
        },
      };
      const json = toJson(node);
      expect(json).toEqual({
        foo: 'bar',
        a: true,
        aha: {},
      });
    });
  });
});