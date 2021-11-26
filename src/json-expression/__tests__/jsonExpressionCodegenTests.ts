import {Expr, JsonExpressionCodegenContext} from '../types';

export type Check = (expression: Expr, expected: unknown, data?: unknown, options?: JsonExpressionCodegenContext) => void;

export const jsonExpressionCodegenTests = (check: Check, {skipOperandArityTests}: {skipOperandArityTests?: boolean} = {}) => {
  describe('Codegen tests', () => {
    describe('get', () => {
      test('can pick from object', () => {
        check(['get', '/foo'], 'bar', {foo: 'bar'});
        check(['=', '/foo'], 'bar', {foo: 'bar'});
        check(['=', '/baz'], undefined, {foo: 'bar'});
      });

      test('can pick using expression', () => {
        check(['get', ['get', '/pointer']], 'bar', {foo: 'bar', pointer: '/foo'});
      });

      test('can pick itself recursively', () => {
        check(['=', ['=', '/pointer']], '/pointer', {foo: 'bar', pointer: '/pointer'});
      });
    });

    describe('eq', () => {
      test('on two literals', () => {
        check(['==', 1, 2], false);
        check(['==', {foo: 'bar'}, {foo: 'bar'}], true);
        check(['==', {foo: 'bar'}, {foo: 'baz'}], false);
        check(['==', [[]], [[]]], true);
      });

      test('literal and expression', () => {
        check(['eq', 3, ['=', '/foo']], false);
        check(['eq', 'bar', ['eq', 1, 1]], false);
        check(['eq', true, ['eq', 1, 1]], true);
      });

      test('together with get', () => {
        check(['eq', 3, ['=', '/foo']], true, {foo: 3});
        check(['eq', ['=', '/foo'], ['=', '/foo']], true, {foo: 3});
        check(['eq', ['=', '/foo'], ['=', '/bar']], true, {foo: 3, bar: 3});
      });
    });

    describe('ne', () => {
      test('on two literals', () => {
        check(['!=', 1, 2], true);
        check(['!=', {foo: 'bar'}, {foo: 'bar'}], false);
        check(['!=', {foo: 'bar'}, {foo: 'baz'}], true);
        check(['!=', [[]], [[]]], false);
      });

      test('literal and expression', () => {
        check(['ne', 3, ['=', '/foo']], true);
        check(['ne', 'bar', ['eq', 1, 1]], true);
        check(['!=', true, ['eq', 1, 1]], false);
      });

      test('together with get', () => {
        check(['ne', 3, ['=', '/foo']], false, {foo: 3});
      });
    });

    describe('not', () => {
      test('on two literals', () => {
        check(['!', ['==', 1, 2]], true);
        check(['!', ['==', {foo: 'bar'}, {foo: 'bar'}]], false);
        check(['not', ['==', {foo: 'bar'}, {foo: 'baz'}]], true);
        check(['not', ['==', [[]], [[]]]], false);
      });

      test('literal and expression', () => {
        check(['!', ['eq', 3, ['=', '/foo']]], true);
        check(['not', ['eq', 'bar', ['eq', 1, 1]]], true);
        check(['not', ['eq', true, ['eq', 1, 1]]], false);
      });

      test('together with get', () => {
        check(['!', ['eq', 3, ['=', '/foo']]], false, {foo: 3});
      });
    });

    describe('if', () => {
      test('works as ternary conditional expression', () => {
        check(['if', true, 1, 2], 1);
        check(['if', false, 1, 2], 2);
        check(['?', true, 1, 2], 1);
        check(['?', false, 1, 2], 2);
      });

      test('all operands are expressions', () => {
        const data = {
          foo: 1,
          bar: 2,
          baz: 3,
        };
        check(['if', ['=', '/foo'], ['=', '/bar'], ['=', '/baz']], 2, data);
        check(['if', ['>', ['=', '/foo'], 10], ['=', '/bar'], ['=', '/baz']], 3, data);
      });
    });

    describe('and', () => {
      test('two operand case', () => {
        check(['and', true, true], true);
        check(['and', true, false], false);
        check(['and', false, false], false);
        check(['and', false, true], false);
        check(['&&', true, true], true);
        check(['&&', true, false], false);
        check(['&&', false, false], false);
        check(['&&', false, true], false);
      });

      test('two operand case', () => {
        check(['and', 1, 1], true);
        check(['and', 1, 0], false);
        check(['and', 0, 1], false);
        check(['and', 0, 0], false);
      });

      test('three operand case', () => {
        check(['and', true, true, true], true);
        check(['and', true, false, true], false);
      });

      test('operands are expressions', () => {
        check(['and', ['get', '/0'], ['get', '/0']], true, [1, 0]);
        check(['and', ['get', '/0'], ['get', '/1']], false, [1, 0]);
        check(['and', ['get', '/0'], 1], true, [1, 0]);
        check(['and', ['get', '/0'], 0], false, [1, 0]);
      });
    });

    describe('or', () => {
      test('two operand case', () => {
        check(['or', true, true], true);
        check(['or', true, false], true);
        check(['or', false, false], false);
        check(['or', false, true], true);
        check(['||', true, true], true);
        check(['||', true, false], true);
        check(['||', false, false], false);
        check(['||', false, true], true);
      });

      test('two operand case', () => {
        check(['or', 1, 1], true);
        check(['or', 1, 0], true);
        check(['or', 0, 1], true);
        check(['or', 0, 0], false);
      });

      test('three operand case', () => {
        check(['or', true, true, true], true);
        check(['or', true, false, true], true);
        check(['or', false, false, false], false);
      });

      test('operands are expressions', () => {
        check(['or', ['get', '/0'], ['get', '/0']], true, [1, 0]);
        check(['or', ['get', '/0'], ['get', '/1']], true, [1, 0]);
        check(['or', ['get', '/0'], 1], true, [1, 0]);
        check(['or', ['get', '/0'], 0], true, [1, 0]);
        check(['or', ['get', '/1'], 0], false, [1, 0]);
      });
    });

    describe('type', () => {
      test('when operand is literal', () => {
        check(['type', 1], 'number');
        check(['type', true], 'boolean');
        check(['type', null], 'null');
        check(['type', 'asdf'], 'string');
        check(['type', [[]]], 'array');
        check(['type', {}], 'object');
      });

      test('when operand is expression', () => {
        check(['type', ['get', '/foo']], 'number', {foo: 1});
        check(['type', ['get', '/foo']], 'boolean', {foo: false});
        check(['type', ['get', '/foo']], 'null', {foo: null});
        check(['type', ['get', '/foo']], 'string', {foo: ''});
        check(['type', ['get', '/foo']], 'array', {foo: []});
        check(['type', ['get', '/foo']], 'object', {foo: {}});
      });
    });

    describe('bool', () => {
      test('when operand is literal', () => {
        check(['bool', 1], true);
        check(['bool', 0], false);
        check(['bool', 0.0], false);
        check(['bool', ''], false);
        check(['bool', 'asdf'], true);
        check(['bool', {}], true);
        check(['bool', [[]]], true);
        check(['bool', true], true);
        check(['bool', false], false);
        check(['bool', null], false);
      });

      test('when operand is expression', () => {
        check(['bool', ['get', '/foo']], true, {foo: 1});
        check(['bool', ['get', '/foo']], false, {foo: 0});
      });
    });

    describe('num', () => {
      test('when operand is literal', () => {
        check(['num', 1], 1);
        check(['num', 0], 0);
        check(['num', 0.0], 0.0);
        check(['num', ''], 0);
        check(['num', '1'], 1);
        check(['num', '1.1'], 1.1);
        check(['num', '1.6'], 1.6);
        check(['num', 'asdf'], 0);
        check(['num', {}], 0);
        check(['num', [[]]], 0);
        check(['num', true], 1);
        check(['num', false], 0);
        check(['num', null], 0);
      });

      test('when operand is expression', () => {
        check(['num', ['get', '/foo']], 1, {foo: 1});
        check(['num', ['get', '/foo']], 5, {foo: '5'});
      });
    });

    describe('int', () => {
      test('when operand is literal', () => {
        check(['int', 1], 1);
        check(['int', 0], 0);
        check(['int', 0.0], 0);
        check(['int', ''], 0);
        check(['int', '1'], 1);
        check(['int', '1.1'], 1);
        check(['int', '1.6'], 1);
        check(['int', 'asdf'], 0);
        check(['int', {}], 0);
        check(['int', [[]]], 0);
        check(['int', true], 1);
        check(['int', false], 0);
        check(['int', null], 0);
      });

      test('when operand is expression', () => {
        check(['int', ['get', '/foo']], 1, {foo: 1});
        check(['int', ['get', '/foo']], 5, {foo: '5'});
      });
    });

    describe('str', () => {
      test('when operand is literal', () => {
        check(['str', 1], '1');
        check(['str', 0], '0');
        check(['str', 0.0], '0');
        check(['str', ''], '');
        check(['str', '1'], '1');
        check(['str', '1.1'], '1.1');
        check(['str', '1.6'], '1.6');
        check(['str', 'asdf'], 'asdf');
        check(['str', {}], '{}');
        check(['str', [[]]], '[]');
        check(['str', true], 'true');
        check(['str', false], 'false');
        check(['str', null], 'null');
      });

      test('when operand is expression', () => {
        check(['str', ['get', '/foo']], '1', {foo: 1});
        check(['str', ['get', '/foo']], '5', {foo: '5'});
      });
    });

    describe('starts', () => {
      test('when operands are literals', () => {
        check(['starts', 'asdf', 'as'], true);
        check(['starts', 'asdf', 'az'], false);
      });

      test('when operands are expressions', () => {
        check(['starts', ['get', '/a'], ['get', '/b']], true, {a: 'document-123', b: 'doc'});
        check(['starts', ['get', '/a'], 'document-'], true, {a: 'document-123', b: 'doc'});
        check(['starts', ['get', '/a'], 'document2-'], false, {a: 'document-123', b: 'doc'});
      });
    });

    describe('contains', () => {
      test('when operands are literals', () => {
        check(['contains', 'asdf', 'as'], true);
        check(['contains', 'asdf', 'az'], false);
        check(['contains', 'zzasdf', 'az'], false);
        check(['contains', 'az', 'az'], true);
        check(['contains', '1az', 'az'], true);
        check(['contains', '1az2', 'az'], true);
      });

      test('when operands are expressions', () => {
        check(['contains', ['get', '/a'], ['get', '/b']], true, {a: 'document-123', b: 'me'});
        check(['contains', ['get', '/a'], ['get', '/b']], true, {a: 'document-123', b: 'do'});
        check(['contains', ['get', '/a'], ['get', '/b']], true, {a: 'document-123', b: '123'});
        check(['contains', ['get', '/a'], ['get', '/b']], false, {a: 'document-123', b: 'me__'});
      });
    });

    describe('ends', () => {
      test('when operands are literals', () => {
        check(['ends', 'asdf', 'df'], true);
        check(['ends', 'asdf', 'f'], true);
        check(['ends', 'asdf', 'f3'], false);
      });

      test('when operands are expressions', () => {
        check(['ends', ['get', '/a'], ['get', '/b']], true, {a: 'document-123', b: '-123'});
        check(['ends', ['get', '/a'], ['get', '/b']], false, {a: 'document-123', b: '-1234'});
      });
    });

    describe('matches', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['matches']  as any, '')).toThrowError(new Error('"matches" operator expects two operands.'));
          expect(() => check(['matches', 'asdf']  as any, '')).toThrowError(new Error('"matches" operator expects two operands.'));
          expect(() => check(['matches', 'asdf', 'asdf', 'asdf']  as any, '')).toThrowError(new Error('"matches" operator expects two operands.'));
        });
      }

      test('throws when pattern is not a string', () => {
        expect(() => check(['matches', 'adsf', 123 as any], 123)).toThrowError(new Error('"matches" second argument should be a regular expression string.'));
      });

      test('works with literals', () => {
        check(['matches', 'aaabbb', 'a{3}b{3}'], true, {}, {
          createPattern: (pattern: string) => {
            const regex = new RegExp(pattern);
            return (subject: string) => regex.test(subject);
          },
        });
      });

      test('works with expressions', () => {
        check(['matches', ['=', '/foo'], 'a{3}b{3}'], true, {
          foo: 'aaabbb'
        }, {
          createPattern: (pattern: string) => {
            const regex = new RegExp(pattern);
            return (subject: string) => regex.test(subject);
          },
        });
        check(['matches', ['=', '/foo'], 'a{3}b{3}'], false, {
          foo: 'aabbb'
        }, {
          createPattern: (pattern: string) => {
            const regex = new RegExp(pattern);
            return (subject: string) => regex.test(subject);
          },
        });
      });
    });

    describe('defined', () => {
      if (!skipOperandArityTests) {
        test('accepts only one operand', () => {
          const callback = () => check(['defined', '/foo', '/bar'] as any, true, {foo: 123});
          expect(callback).toThrowError(new Error('"defined" operator expects one operand.'));
        });
      }

      test('validates JSON Pointer', () => {
        const callback = () => check(['defined', null] as any, true, {foo: 123});
        expect(callback).toThrowError(new Error('Invalid JSON pointer.'));
      });

      test('check if data member is defined', () => {
        check(['defined', '/foo'], true, {foo: [0, 1]})
        check(['defined', '/foo/0'], true, {foo: [0, 1]})
        check(['defined', '/foo/1'], true, {foo: [0, 1]})
        check(['defined', '/foo/2'], false, {foo: [0, 1]})
        check(['defined', '/bar'], false, {foo: [0, 1]})
      });
    });

    describe('in', () => {
      test('works with literals', () => {
        check(['in', 'foo', [[]]], false, {foo: 'bar'});
        check(['in', 'foo', [['a']]], false, {foo: 'bar'});
        check(['in', 'foo', [['foo']]], true, {foo: 'bar'});
        check(['in', 'foo', [['a', {b: 'b'}]]], false, {foo: 'bar'});
        check(['in', {b: 'b'}, [['a', {b: 'b'}]]], true, {foo: 'bar'});
      });

      test('works with expressions', () => {
        check(['in', ['=', '/foo'], [[]]], false, {foo: 'bar'});
        check(['in', ['=', '/foo'], [['gg']]], false, {foo: 'bar'});
        check(['in', ['=', '/foo'], [['gg', 'bar']]], true, {foo: 'bar'});
        check(['in', ['=', '/foo'], [['bar']]], true, {foo: 'bar'});
        check(['in', ['=', '/foo'], [['bar1']]], false, {foo: 'bar'});
        check(['in', ['=', '/foo'], [['gg', 'bar', 'ss']]], true, {foo: 'bar'});
        check(['in', ['=', '/foo'], ['=', '/lol']], true, {foo: 'bar', lol: ['gg', 'bar', 'ss']});
        check(['in', ['=', '/foo'], ['=', '/lol']], false, {foo: 'bar', lol: ['gg', 'ss']});
        check(['in', 'ss', ['=', '/lol']], true, {foo: 'bar', lol: ['gg', 'ss']});
      });
    });

    describe('cat', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['cat'], '')).toThrowError(new Error('"cat" operator expects at least two operands.'));
          expect(() => check(['cat', 'a'], '')).toThrowError(new Error('"cat" operator expects at least two operands.'));
        });
      }

      test('works with literals', () => {
        check(['cat', 'a', 'ds'], 'ads');
      });

      test('works with expressions', () => {
        check(
          ['cat',
            ['get', '/2'],
            ['get', '/1'],
            ['get', '/0'],
          ], 'cba', ['a', 'b', 'c']);
      });
    });

    describe('substr', () => {
      if (!skipOperandArityTests) {
        test('throws on too few or too many operands', () => {
          expect(() => check(['substr']  as any, '')).toThrowError(new Error('"substr" operator expects two or three operands.'));
          expect(() => check(['substr', 'str']  as any, '')).toThrowError(new Error('"substr" operator expects two or three operands.'));
          expect(() => check(['substr', 'str', 1, 1, 1]  as any, '')).toThrowError(new Error('"substr" operator expects two or three operands.'));
        });
      }

      test('works with literals', () => {
        check(['substr', '0123456789', 0, 3], '012');
        check(['substr', '0123456789', 1, 3], '123');
        check(['substr', '0123456789', -4, 3], '678');
        check(['substr', '0123456789', 7, 4], '789');
      });

      test('works with expressions', () => {
        check(['substr', ['=', '/str'], 0, 3], '012', {str: '0123456789'});
        check(['substr', ['=', '/str'], ['=', '/from'], 3], '234', {str: '0123456789', from: 2});
        check(['substr', ['=', '/str'], ['=', '/from'], ['=', '/len']], '23', {str: '0123456789', from: 2, len: 2});
      });
    });

    describe('less than', () => {
      if (!skipOperandArityTests) {
        test('throws on too few or too many operands', () => {
          expect(() => check(['<']  as any, '')).toThrowError(new Error('"<" operator expects two operands.'));
          expect(() => check(['<', 1]  as any, '')).toThrowError(new Error('"<" operator expects two operands.'));
          expect(() => check(['<', 1, 2, 3]  as any, '')).toThrowError(new Error('"<" operator expects two operands.'));
        });
      }

      test('works with literals', () => {
        check(['<', 1, 2.4], true);
        check(['<', 3.33, 3.333], true);
        check(['<', 1, '2.4'], true);
        check(['<', '2.4', 0], false);
      });

      test('works with expressions', () => {
        check(['<', ['=', '/0'], ['=', '/1']], true, [1, 2.4]);
        check(['<', ['=', '/0'], ['=', '/1']], true, [3.33, 3.333]);
        check(['<', ['=', '/1'], ['=', '/0']], false, [1, 2.4]);
        check(['<', ['=', '/1'], ['=', '/1']], false, [1, 2.4]);
        check(['<', ['=', '/0'], ['=', '/0']], false, [0, 2.4]);
      });
    });

    describe('less than or equal', () => {
      if (!skipOperandArityTests) {
        test('throws on too few or too many operands', () => {
          expect(() => check(['<=']  as any, '')).toThrowError(new Error('"<=" operator expects two operands.'));
          expect(() => check(['<=', 1]  as any, '')).toThrowError(new Error('"<=" operator expects two operands.'));
          expect(() => check(['<=', 1, 2, 3]  as any, '')).toThrowError(new Error('"<=" operator expects two operands.'));
        });
      }

      test('works with literals', () => {
        check(['<=', 1, 2.4], true);
        check(['<=', 1, '2.4'], true);
        check(['<=', 3.33, 3.333], true);
        check(['<=', '2.4', 0], false);
        check(['<=', 0, 0], true);
      });

      test('works with expressions', () => {
        check(['<=', ['=', '/0'], ['=', '/1']], true, [1, 2.4]);
        check(['<=', ['=', '/0'], ['=', '/1']], true, [3.33, 3.333]);
        check(['<=', ['=', '/1'], ['=', '/0']], false, [1, 2.4]);
        check(['<=', ['=', '/1'], ['=', '/1']], true, [1, 2.4]);
        check(['<=', ['=', '/0'], ['=', '/0']], true, [0, 2.4]);
      });
    });

    describe('greater than', () => {
      if (!skipOperandArityTests) {
        test('throws on too few or too many operands', () => {
          expect(() => check(['>']  as any, '')).toThrowError(new Error('">" operator expects two operands.'));
          expect(() => check(['>', 1]  as any, '')).toThrowError(new Error('">" operator expects two operands.'));
          expect(() => check(['>', 1, 2, 3]  as any, '')).toThrowError(new Error('">" operator expects two operands.'));
        });
      }

      test('works with literals', () => {
        check(['>', 1, 2.4], false);
        check(['>', 1, '2.4'], false);
        check(['>', '2.4', 0], true);
        check(['>', 3.333, 3.33], true);
        check(['>', 0, 0], false);
      });

      test('works with expressions', () => {
        check(['>', ['=', '/0'], ['=', '/1']], false, [1, 2.4]);
        check(['>', ['=', '/1'], ['=', '/0']], true, [1, 2.4]);
        check(['>', ['=', '/0'], ['=', '/1']], true, [3.333, 3.33]);
        check(['>', ['=', '/1'], ['=', '/1']], false, [1, 2.4]);
        check(['>', ['=', '/0'], ['=', '/0']], false, [0, 2.4]);
      });
    });

    describe('greater than or equal', () => {
      if (!skipOperandArityTests) {
        test('throws on too few or too many operands', () => {
          expect(() => check(['>=']  as any, '')).toThrowError(new Error('">=" operator expects two operands.'));
          expect(() => check(['>=', 1]  as any, '')).toThrowError(new Error('">=" operator expects two operands.'));
          expect(() => check(['>=', 1, 2, 3]  as any, '')).toThrowError(new Error('">=" operator expects two operands.'));
        });
      }

      test('works with literals', () => {
        check(['>=', 1, 2.4], false);
        check(['>=', 1, '2.4'], false);
        check(['>=', '2.4', 0], true);
        check(['>=', 3.333, 3.33], true);
        check(['>=', 0, 0], true);
      });

      test('works with expressions', () => {
        check(['>=', ['=', '/0'], ['=', '/1']], false, [1, 2.4]);
        check(['>=', ['=', '/1'], ['=', '/0']], true, [1, 2.4]);
        check(['>=', ['=', '/0'], ['=', '/1']], true, [3.333, 3.33]);
        check(['>=', ['=', '/1'], ['=', '/1']], true, [1, 2.4]);
        check(['>=', ['=', '/0'], ['=', '/0']], true, [0, 2.4]);
      });
    });

    describe('min', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['min']  as any, '')).toThrowError(new Error('"min" operator expects at least two operands.'));
          expect(() => check(['min', 1]  as any, '')).toThrowError(new Error('"min" operator expects at least two operands.'));
        });
      }

      test('works with literals', () => {
        check(['min', 1, 2], 1);
        check(['min', 1, 2, null], 0);
        check(['min', 1, 2, 0.4], .4);
        check(['min', 1, 2, 0.4, '.1'], .1);
      });

      test('works with expressions', () => {
        check(['min', ['=', '/1'], ['=', '/2'], ['=', '/0']], 3.3, [3.3, 4.4, 5.5]);
      });
    });

    describe('max', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['max']  as any, '')).toThrowError(new Error('"max" operator expects at least two operands.'));
          expect(() => check(['max', 1]  as any, '')).toThrowError(new Error('"max" operator expects at least two operands.'));
        });
      }

      test('works with literals', () => {
        check(['max', 1, 2], 2);
        check(['max', 1, 2, 2.4], 2.4);
        check(['max', 1, 2, 2.4, '4.1'], 4.1);
      });

      test('works with expressions', () => {
        check(['max', ['=', '/1'], ['=', '/2'], ['=', '/0']], 5.5, [3.3, 4.4, 5.5]);
      });
    });

    describe('plus', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['+']  as any, '')).toThrowError(new Error('"+" operator expects at least two operands.'));
          expect(() => check(['+', 1]  as any, '')).toThrowError(new Error('"+" operator expects at least two operands.'));
        });
      }

      test('works with literals', () => {
        check(['+', 1, 2, 3, 4], 10);
      });

      test('does not concatenate strings', () => {
        check(['+', '1', 1], 2);
        check(['+', ['=', '/0'], ['=', '/1']], 2, ['1', 1]);
      });

      test('works with expressions', () => {
        check(['+',
          ['=', '/0'],
          ['=', '/1'],
          ['=', '/2'],
          ['=', '/3'],
        ], 10, [1, 2, 3, 4]);
      });
    });

    describe('minus', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['-']  as any, '')).toThrowError(new Error('"-" operator expects at least two operands.'));
          expect(() => check(['-', 1]  as any, '')).toThrowError(new Error('"-" operator expects at least two operands.'));
        });
      }

      test('works with literals', () => {
        check(['-', 4, 1, 2, 3], -2);
      });

      test('works with expressions', () => {
        check(['-',
          ['=', '/0'],
          ['=', '/1'],
          ['=', '/2'],
          ['=', '/3'],
        ], -8, [1, 2, 3, 4]);
      });
    });

    describe('multiplication', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['*']  as any, '')).toThrowError(new Error('"*" operator expects at least two operands.'));
          expect(() => check(['*', 1]  as any, '')).toThrowError(new Error('"*" operator expects at least two operands.'));
        });
      }

      test('works with literals', () => {
        check(['*', 1, 2, 3, 4], 24);
      });

      test('works with expressions', () => {
        check(['*',
          ['=', '/0'],
          ['=', '/1'],
          ['=', '/2'],
          ['=', '/3'],
        ], 24, [1, 2, 3, 4]);
      });
    });

    describe('division', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['/']  as any, '')).toThrowError(new Error('"/" operator expects two operands.'));
          expect(() => check(['/', 1]  as any, '')).toThrowError(new Error('"/" operator expects two operands.'));
          expect(() => check(['/', 1, 1, 1]  as any, '')).toThrowError(new Error('"/" operator expects two operands.'));
        });
      }

      test('works with literals', () => {
        check(['/', 1, 1], 1);
        check(['/', 5, 2], 2.5);
        check(['/', 5, 0], 0);
        check(['/', 5, -0], 0);
      });

      test('works with expressions', () => {
        check(['/',
          ['=', '/0'],
          ['=', '/1'],
        ], 0.5, [1, 2]);
        check(['/',
          ['=', '/0'],
          ['=', '/1'],
        ], 0, [1, 0]);
      });
    });

    describe('mod', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['%']  as any, '')).toThrowError(new Error('"%" operator expects two operands.'));
          expect(() => check(['%', 1]  as any, '')).toThrowError(new Error('"%" operator expects two operands.'));
          expect(() => check(['%', 1, 1, 1]  as any, '')).toThrowError(new Error('"%" operator expects two operands.'));
        });
      }

      test('works with literals', () => {
        check(['%', 1, 1], 0);
        check(['%', 5, 2], 1);
        check(['%', 5, 0], 0);
        check(['%', 5, -0], 0);
      });

      test('works with expressions', () => {
        check(['%',
          ['=', '/0'],
          ['=', '/1'],
        ], 1, [1, 2]);
        check(['%',
          ['=', '/0'],
          ['=', '/1'],
        ], 0, [1, 0]);
        check(['%',
          ['=', '/0'],
          ['=', '/1'],
        ], 1, [5, 2]);
        check(['%',
          ['=', '/0'],
          ['=', '/1'],
        ], 3, [7, 4]);
      });
    });

    describe('round', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['round']  as any, '')).toThrowError(new Error('"round" operator expects one operand.'));
          expect(() => check(['round', 1, 1]  as any, '')).toThrowError(new Error('"round" operator expects one operand.'));
        });
      }

      test('works with literals', () => {
        check(['round', 1.5], 2);
        check(['round', 1.3], 1);
        check(['round', 1], 1);
        check(['round', '3.6'], 4);
        check(['round', 3.6], 4);
      });

      test('works with expressions', () => {
        check(['round', ['=', '/0']], 2, [1.5]);
        check(['round', ['=', '/0']], 1, [1]);
        check(['round', ['=', '/0']], 4, ['3.6']);
        check(['round', ['=', '/0']], 4, [3.6]);
      });
    });

    describe('ceil', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['ceil']  as any, '')).toThrowError(new Error('"ceil" operator expects one operand.'));
          expect(() => check(['ceil', 1, 1]  as any, '')).toThrowError(new Error('"ceil" operator expects one operand.'));
        });
      }

      test('works with literals', () => {
        check(['ceil', 1.5], 2);
        check(['ceil', 1.3], 2);
        check(['ceil', 1], 1);
        check(['ceil', '3.6'], 4);
        check(['ceil', 3.6], 4);
      });

      test('works with expressions', () => {
        check(['ceil', ['=', '/0']], 2, [1.5]);
        check(['ceil', ['=', '/0']], -1, [-1.2]);
        check(['ceil', ['=', '/0']], -1, [-1.8]);
        check(['ceil', ['=', '/0']], 1, [1]);
        check(['ceil', ['=', '/0']], 4, ['3.6']);
        check(['ceil', ['=', '/0']], 4, [3.6]);
      });
    });

    describe('floor', () => {
      if (!skipOperandArityTests) {
        test('throws on too few operands', () => {
          expect(() => check(['floor']  as any, '')).toThrowError(new Error('"floor" operator expects one operand.'));
          expect(() => check(['floor', 1, 1]  as any, '')).toThrowError(new Error('"floor" operator expects one operand.'));
        });
      }

      test('works with literals', () => {
        check(['floor', 1.5], 1);
        check(['floor', 1.3], 1);
        check(['floor', 1], 1);
        check(['floor', '3.6'], 3);
        check(['floor', 3.6], 3);
      });

      test('works with expressions', () => {
        check(['floor', ['=', '/0']], 1, [1.5]);
        check(['floor', ['=', '/0']], -2, [-1.2]);
        check(['floor', ['=', '/0']], -2, [-1.8]);
        check(['floor', ['=', '/0']], 1, [1]);
        check(['floor', ['=', '/0']], 3, ['3.6']);
        check(['floor', ['=', '/0']], 3, [3.6]);
      });
    });
  });
};
