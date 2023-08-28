import {Expr, JsonExpressionCodegenContext} from '../types';

export type Check = (
  expression: Expr,
  expected: unknown,
  data?: unknown,
  options?: JsonExpressionCodegenContext,
) => void;

export const jsonExpressionUnitTests = (
  check: Check,
  {skipOperandArityTests}: {skipOperandArityTests?: boolean} = {},
) => {
  describe('Arithmetic operators', () => {
    describe('add or +', () => {
      test('can add numbers', () => {
        check(['add', 1, 2], 3);
        check(['+', 1, 2], 3);
      });

      test('evaluates sub-expressions', () => {
        check(['add', 1, ['add', 1, 1]], 3);
        check(['+', 1, ['+', 1, 1]], 3);
      });

      test('is variadic', () => {
        check(['add', 1, 1, 1, 1], 4);
        check(['+', 1, 2, 3, 4], 10);
      });

      test('casts strings to numbers', () => {
        check(['add', '2', '2'], 4);
        check(['+', '1', '10.5'], 11.5);
      });

      test('throws on too few arguments', () => {
        expect(() => check(['add', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""+" operator expects at least two operands."`,
        );
        expect(() => check(['+', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""+" operator expects at least two operands."`,
        );
      });
    });

    describe('subtract or -', () => {
      test('two operands', () => {
        check(['subtract', 1, 2], -1);
        check(['-', 1, 2], -1);
      });

      test('evaluates sub-expressions', () => {
        check(['subtract', 1, ['subtract', 1, 1]], 1);
        check(['-', 1, ['-', 1, 1]], 1);
      });

      test('is variadic', () => {
        check(['subtract', 1, 1, 1, 1], -2);
        check(['-', 1, 2, 3, 4], -8);
      });

      test('casts strings to numbers', () => {
        check(['subtract', '2', '2'], 0);
        check(['-', '1', '10.5'], -9.5);
      });

      test('throws on too few arguments', () => {
        expect(() => check(['subtract', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""-" operator expects at least two operands."`,
        );
        expect(() => check(['-', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""-" operator expects at least two operands."`,
        );
      });
    });

    describe('multiply or *', () => {
      test('two operands', () => {
        check(['multiply', 1, 2], 2);
        check(['*', 3, 2], 6);
      });

      test('evaluates sub-expressions', () => {
        check(['multiply', 1, ['multiply', 1, 1]], 1);
        check(['*', 0.5, ['*', 4, 4]], 8);
      });

      test('is variadic', () => {
        check(['multiply', 2, 2, 2, 2], 16);
        check(['*', 1, 2, 3, 4], 24);
      });

      test('casts strings to numbers', () => {
        check(['multiply', '2', '2'], 4);
        check(['*', '1', '10.5'], 10.5);
      });

      test('throws on too few arguments', () => {
        expect(() => check(['multiply', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""*" operator expects at least two operands."`,
        );
        expect(() => check(['*', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""*" operator expects at least two operands."`,
        );
      });
    });

    describe('divide or /', () => {
      test('two operands', () => {
        check(['divide', 1, 2], 0.5);
        check(['/', 3, 2], 1.5);
      });

      test('evaluates sub-expressions', () => {
        check(['divide', 1, ['divide', 4, 2]], 0.5);
        check(['/', 0.5, ['/', 4, 4]], 0.5);
      });

      test('is variadic', () => {
        check(['divide', 2, 2, 2, 2], 0.25);
        check(['/', 32, 2, 4, ['+', 1, 1]], 2);
      });

      test('casts strings to numbers', () => {
        check(['divide', '4', '2'], 2);
        check(['/', '1', '10'], 0.1);
      });

      test('throws on too few arguments', () => {
        expect(() => check(['divide', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""/" operator expects at least two operands."`,
        );
        expect(() => check(['/', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""/" operator expects at least two operands."`,
        );
      });

      test('throws throws when dividing by zero', () => {
        expect(() => check(['divide', 1, 0], 0)).toThrowErrorMatchingInlineSnapshot(`"DIVISION_BY_ZERO"`);
        expect(() => check(['/', ['+', 1, 1], 0], 0)).toThrowErrorMatchingInlineSnapshot(`"DIVISION_BY_ZERO"`);
      });
    });

    describe('divide or %', () => {
      test('two operands', () => {
        check(['mod', 1, 2], 1);
        check(['%', 3, 2], 1);
      });

      test('evaluates sub-expressions', () => {
        check(['mod', 3, ['mod', 4, 3]], 0);
        check(['%', 5, ['%', 7, 5]], 1);
      });

      test('is variadic', () => {
        check(['mod', 13, 7, 4, 2], 0);
        check(['%', 32, 25, 4, ['%', 5, 3]], 1);
      });

      test('casts strings to numbers', () => {
        check(['mod', '4', '2'], 0);
        check(['%', '1', '10'], 1);
      });

      test('throws on too few arguments', () => {
        expect(() => check(['mod', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""%" operator expects at least two operands."`,
        );
        expect(() => check(['%', 1], 2)).toThrowErrorMatchingInlineSnapshot(
          `""%" operator expects at least two operands."`,
        );
      });

      test('throws throws when dividing by zero', () => {
        expect(() => check(['mod', 1, 0], 0)).toThrowErrorMatchingInlineSnapshot(`"DIVISION_BY_ZERO"`);
        expect(() => check(['%', ['+', 1, 1], 0], 0)).toThrowErrorMatchingInlineSnapshot(`"DIVISION_BY_ZERO"`);
      });
    });

    describe('min', () => {
      test('two operands', () => {
        check(['min', 1, 2], 1);
      });

      test('evaluates sub-expressions', () => {
        check(['min', 5, ['min', 4, 3]], 3);
      });

      test('is variadic', () => {
        check(['min', 13, 7, 4, 2], 2);
      });

      test('casts strings to numbers', () => {
        check(['min', '4', '2'], 2);
      });
    });

    describe('max', () => {
      test('two operands', () => {
        check(['max', 1, 2], 2);
      });

      test('evaluates sub-expressions', () => {
        check(['max', 5, ['max', 4, 3]], 5);
      });

      test('is variadic', () => {
        check(['max', 13, 7, 4, 2], 13);
      });

      test('casts strings to numbers', () => {
        check(['max', '4', '2'], 4);
      });
    });

    describe('round', () => {
      test('can round', () => {
        check(['round', 1.6], 2);
        check(['round', 3], 3);
      });

      test('evaluates sub-expressions', () => {
        check(['round', ['round', 5.8]], 6);
      });

      test('throws on too few arguments', () => {
        expect(() => check(['round', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""round" operator expects 1 operands."`,
        );
      });
    });

    describe('ceil', () => {
      test('can round', () => {
        check(['ceil', 1.6], 2);
        check(['ceil', 1.2], 2);
        check(['ceil', 3], 3);
      });

      test('evaluates sub-expressions', () => {
        check(['ceil', ['ceil', 5.8]], 6);
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['ceil', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""ceil" operator expects 1 operands."`,
        );
      });
    });

    describe('floor', () => {
      test('can round', () => {
        check(['floor', 1.6], 1);
        check(['floor', 1.2], 1);
        check(['floor', 3], 3);
      });

      test('evaluates sub-expressions', () => {
        check(['floor', ['floor', 5.8]], 5);
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['floor', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""floor" operator expects 1 operands."`,
        );
      });
    });

    describe('trunc', () => {
      test('can round', () => {
        check(['trunc', 1.6], 1);
        check(['trunc', -1.2], -1);
        check(['trunc', -3.7], -3);
      });

      test('evaluates sub-expressions', () => {
        check(['trunc', ['trunc', 5.8]], 5);
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['trunc', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""trunc" operator expects 1 operands."`,
        );
      });
    });

    describe('abs', () => {
      test('returns positive value', () => {
        check(['abs', ['+', 0, 1.6]], 1.6);
        check(['abs', ['+', 0, -1.2]], 1.2);
        check(['abs', ['+', 0, -3]], 3);
        check(['abs', ['+', 0, 5]], 5);
      });

      test('evaluates sub-expressions', () => {
        check(['abs', ['abs', -5.8]], 5.8);
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['abs', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""abs" operator expects 1 operands."`,
        );
      });
    });

    describe('sqrt', () => {
      test('returns the root', () => {
        check(['sqrt', ['+', 0, 9]], 3);
        check(['sqrt', 16], 4);
        check(['sqrt', ['+', 0, 1]], 1);
      });

      test('evaluates sub-expressions', () => {
        check(['sqrt', ['sqrt', 81]], 3);
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['sqrt', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""sqrt" operator expects 1 operands."`,
        );
      });
    });

    describe('exp', () => {
      test('returns exponent', () => {
        check(['exp', ['+', 0, 2]], Math.exp(2));
        check(['exp', 3], Math.exp(3));
        check(['exp', ['+', 0, 4.4]], Math.exp(4.4));
      });

      test('evaluates sub-expressions', () => {
        check(['exp', ['exp', 2]], Math.exp(Math.exp(2)));
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['exp', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""exp" operator expects 1 operands."`,
        );
      });
    });

    describe('ln', () => {
      test('returns logarithm', () => {
        check(['ln', ['+', 0, 2]], Math.log(2));
        check(['ln', 3], Math.log(3));
        check(['ln', ['+', 0, 4.4]], Math.log(4.4));
      });

      test('evaluates sub-expressions', () => {
        check(['ln', ['ln', 2]], Math.log(Math.log(2)));
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['ln', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""ln" operator expects 1 operands."`,
        );
      });
    });

    describe('log10', () => {
      test('returns logarithm', () => {
        check(['log10', ['+', 0, 2]], Math.log10(2));
        check(['log10', 3], Math.log10(3));
        check(['log10', ['+', 0, 4.4]], Math.log10(4.4));
      });

      test('evaluates sub-expressions', () => {
        check(['log10', ['log10', 2]], Math.log10(Math.log10(2)));
      });

      test('throws on too few or too many arguments', () => {
        expect(() => check(['log10', 1, 2] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""log10" operator expects 1 operands."`,
        );
      });
    });

    describe('log', () => {
      const log = (num: number, base: number) => Math.log(num) / Math.log(base);

      test('returns logarithm', () => {
        check(['log', ['+', 0, 2], 8], log(2, 8));
        check(['log', 3, 5], log(3, 5));
        check(['log', ['+', 0, 4.4], 6], log(4.4, 6));
      });

      test('evaluates sub-expressions', () => {
        check(['log', ['log', 2, 2], 5], log(log(2, 2), 5));
      });

      test('throws on too many arguments', () => {
        expect(() => check(['log', 1, 2, 3, 4] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""log" operator expects 2 operands."`,
        );
      });
    });

    describe('pow', () => {
      const pow = (num: number, base: number) => num ** base;

      test('returns logarithm', () => {
        check(['pow', ['+', 0, 2], 8], pow(2, 8));
        check(['**', 3, 5], pow(3, 5));
        check(['**', ['+', 0, 4.4], 6], pow(4.4, 6));
      });

      test('evaluates sub-expressions', () => {
        check(['pow', ['pow', 2, 2], 5], pow(pow(2, 2), 5));
      });

      test('throws on too many arguments', () => {
        expect(() => check(['pow', 1, 2, 3, 4] as any, 2)).toThrowErrorMatchingInlineSnapshot(
          `""**" operator expects 2 operands."`,
        );
      });
    });
  });

  describe('Comparison operators', () => {
    describe('eq or ==', () => {
      test('can compare numbers', () => {
        check(['eq', 1, 1], true);
        check(['eq', 5, ['+', 0, 5]], true);
        check(['==', 5, 4], false);
        check(['==', ['+', 0, 5], -5], false);
      });

      test('can compare strings', () => {
        check(['eq', '1', '1'], true);
        check(['eq', 'abc', 'abc'], true);
        check(['eq', 'abc', 'abc!'], false);
      });

      test('can compare strings', () => {
        check(['eq', '1', '1'], true);
        check(['eq', 'abc', 'abc'], true);
        check(['eq', 'abc', 'abc!'], false);
      });

      test('can compare booleans', () => {
        check(['eq', true, true], true);
        check(['eq', true, false], false);
        check(['eq', false, true], false);
        check(['eq', false, false], true);
      });

      test('deeply compares objects', () => {
        check(['eq', {foo: 'bar'}, {foo: 'bar'}], true);
      });

      test('different types', () => {
        check(['eq', 1, '1'], false);
        check(['eq', 123, '123'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['eq', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""==" operator expects 2 operands."`,
        );
        expect(() => check(['eq', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""==" operator expects 2 operands."`,
        );
      });
    });

    describe('ne or !=', () => {
      test('can compare numbers', () => {
        check(['ne', 1, 1], false);
        check(['!=', 5, ['+', 0, 5]], false);
        check(['ne', 5, 4], true);
        check(['!=', ['+', 0, 5], -5], true);
      });

      test('can compare strings', () => {
        check(['ne', '1', '1'], false);
        check(['ne', 'abc', 'abc'], false);
        check(['ne', 'abc', 'abc!'], true);
      });

      test('can compare strings', () => {
        check(['ne', '1', '1'], false);
        check(['ne', 'abc', 'abc'], false);
        check(['ne', 'abc', 'abc!'], true);
      });

      test('can compare booleans', () => {
        check(['ne', true, true], false);
        check(['ne', true, false], true);
        check(['ne', false, true], true);
        check(['ne', false, false], false);
      });

      test('deeply compares objects', () => {
        check(['ne', {foo: 'bar'}, {foo: 'bar'}], false);
        check(['ne', {foo: 'bar'}, {foo: 'bar!'}], true);
      });

      test('different types', () => {
        check(['ne', 1, '1'], true);
        check(['ne', 123, '123'], true);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['ne', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""!=" operator expects 2 operands."`,
        );
        expect(() => check(['!=', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""!=" operator expects 2 operands."`,
        );
      });
    });

    describe('gt or >', () => {
      test('can compare numbers', () => {
        check(['>', 2, 1], true);
        check(['>', 5, ['+', 0, 5]], false);
        check(['gt', 5, 4], true);
        check(['gt', ['+', 0, 5], -5], true);
      });

      test('can compare strings', () => {
        check(['>', ['get', '/1'], ['get', '/0']], true, ['1', '22']);
        check(['>', ['get', '/1'], ['get', '/0']], false, ['bb', 'a']);
        check(['>', ['get', '/1'], ['get', '/0']], true, ['bb', 'ccc']);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['gt', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `"">" operator expects 2 operands."`,
        );
        expect(() => check(['>', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `"">" operator expects 2 operands."`,
        );
      });
    });

    describe('ge or >=', () => {
      test('can compare numbers', () => {
        check(['>=', 2, 1], true);
        check(['>=', 5, ['+', 0, 5]], true);
        check(['ge', 5, 4], true);
        check(['ge', ['+', 0, 5], -5], true);
      });

      test('can compare strings', () => {
        check(['>=', '22', '1'], true);
        check(['>=', 'bb', 'a'], true);
        check(['>=', 'bb', 'bb'], true);
        check(['>=', 'bb', 'ccc'], false);
        check(['>=', ['get', '/1'], ['get', '/0']], true, ['1', '22']);
        check(['>=', ['get', '/1'], ['get', '/0']], false, ['bb', 'a']);
        check(['>=', ['get', '/1'], ['get', '/0']], true, ['bb', 'ccc']);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['ge', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `"">=" operator expects 2 operands."`,
        );
        expect(() => check(['>=', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `"">=" operator expects 2 operands."`,
        );
      });
    });

    describe('lt or <', () => {
      test('can compare numbers', () => {
        check(['<', 2, ['get', '/a']], false, {a: 1});
        check(['<', 2, ['get', '/a']], true, {a: 4});
        check(['<', 2, 5], true);
        check(['<', 5, ['+', 0, 5]], false);
      });

      test('"lt" alias works', () => {
        check(['lt', 2, ['get', '/a']], false, {a: 1});
        check(['lt', 2, ['get', '/a']], true, {a: 4});
        check(['lt', 2, 1], false);
        check(['lt', 2, 4], true);
      });

      test('can compare strings', () => {
        check(['<', '22', '1'], false);
        check(['<', 'bb', 'a'], false);
        check(['<', ['get', '/1'], ['get', '/0']], false, ['1', '22']);
        check(['<', ['get', '/1'], ['get', '/0']], true, ['bb', 'a']);
        check(['<', ['get', '/1'], ['get', '/0']], false, ['bb', 'ccc']);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['lt', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""<" operator expects 2 operands."`,
        );
        expect(() => check(['<', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""<" operator expects 2 operands."`,
        );
      });
    });

    describe('le or <=', () => {
      test('can compare numbers', () => {
        check(['<=', 2, 1], false);
        check(['<=', 5, ['+', 0, 5]], true);
        check(['le', 5, 4], false);
        check(['le', ['+', 0, 5], -5], false);
      });

      test('can compare strings', () => {
        check(['<=', '22', '1'], false);
        check(['<=', 'bb', 'a'], false);
        check(['<=', 'bb', 'bb'], true);
        check(['<=', 'bb', 'ccc'], true);
        check(['<=', ['get', '/1'], ['get', '/0']], false, ['1', '22']);
        check(['<=', ['get', '/1'], ['get', '/0']], true, ['bb', 'a']);
        check(['<=', ['get', '/1'], ['get', '/0']], false, ['bb', 'ccc']);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['le', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""<=" operator expects 2 operands."`,
        );
        expect(() => check(['<=', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""<=" operator expects 2 operands."`,
        );
      });
    });

    describe('cmp', () => {
      test('can compare numbers', () => {
        check(['cmp', 2, 1], 1);
        check(['cmp', 2, 4], -1);
        check(['cmp', 3.3, 3.3], 0);
      });

      test('can compare strings', () => {
        check(['cmp', '22', '1'], 1);
        check(['cmp', '22', '33'], -1);
        check(['cmp', '22', ['$', '']], 0, '22');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['cmp', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""cmp" operator expects 2 operands."`,
        );
        expect(() => check(['cmp', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""cmp" operator expects 2 operands."`,
        );
      });
    });

    describe('between or =><=', () => {
      test('can compare numbers', () => {
        check(['=><=', 1.5, 1, 2], true);
        check(['=><=', 2, 1, 2], true);
        check(['=><=', 1, 1, 2], true);
        check(['=><=', ['get', ''], 1, 2], true, 1.4);
        check(['between', ['get', ''], 1, 2], false, 2.7);
      });

      test('can compare strings', () => {
        check(['=><=', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['between', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['between', 'dddd', 'a', 'ccc'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['=><=', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""=><=" operator expects 3 operands."`,
        );
        expect(() => check(['=><=', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""=><=" operator expects 3 operands."`,
        );
        expect(() => check(['between', 1, 2, 3, 4] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""=><=" operator expects 3 operands."`,
        );
      });
    });

    describe('><', () => {
      test('can compare numbers', () => {
        check(['><', 1.5, 1, 2], true);
        check(['><', ['get', ''], 1, 2], true, 1.4);
      });

      test('can compare strings', () => {
        check(['><', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['><', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['><', 'dddd', 'a', 'ccc'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['><', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""><" operator expects 3 operands."`,
        );
        expect(() => check(['><', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""><" operator expects 3 operands."`,
        );
        expect(() => check(['><', 1, 2, 3, 4] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""><" operator expects 3 operands."`,
        );
      });
    });

    describe('=><', () => {
      test('can compare numbers', () => {
        check(['=><', 1.5, 1, 2], true);
        check(['=><', 1, 1, 2], true);
        check(['=><', ['get', ''], 1, 2], true, 1.4);
      });

      test('can compare strings', () => {
        check(['=><', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['=><', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['=><', ['get', ''], 'a', 'ccc'], true, 'a');
        check(['=><', 'dddd', 'a', 'ccc'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['=><', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""=><" operator expects 3 operands."`,
        );
        expect(() => check(['=><', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""=><" operator expects 3 operands."`,
        );
        expect(() => check(['=><', 1, 2, 3, 4] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""=><" operator expects 3 operands."`,
        );
      });
    });

    describe('><=', () => {
      test('can compare numbers', () => {
        check(['><=', 1.5, 1, 2], true);
        check(['><=', 2, 1, 2], true);
        check(['><=', ['get', ''], 1, 2], true, 1.4);
      });

      test('can compare strings', () => {
        check(['><=', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['><=', ['get', ''], 'a', 'ccc'], true, 'bb');
        check(['><=', ['get', ''], 'a', 'ccc'], true, 'ccc');
        check(['><=', 'dddd', 'a', 'ccc'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['><=', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""><=" operator expects 3 operands."`,
        );
        expect(() => check(['><=', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""><=" operator expects 3 operands."`,
        );
        expect(() => check(['><=', 1, 2, 3, 4] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""><=" operator expects 3 operands."`,
        );
      });
    });
  });

  describe('Logical operators', () => {
    describe('and or &&', () => {
      test('works with booleans', () => {
        check(['&&', true, false], false);
        check(['&&', true, true], true);
        check(['&&', false, ['get', '']], false, true);
        check(['&&', ['get', ''], ['get', '']], true, true);
        check(['&&', ['get', ''], ['get', '']], false, false);
      });

      test('variadic form works', () => {
        check(['&&', true, true], true);
        check(['&&', true, true, true], true);
        check(['&&', true, true, true, false], false);
        check(['&&', true, false, true, true], false);
        check(['&&', true, ['get', ''], true, true], false, false);
      });

      test('returns the last value, when all values truthy', () => {
        check(['&&', 1, 1], 1);
        check(['&&', 1, 2], 2);
        check(['&&', 1, 2, '3'], '3');
        check(['&&', 1, 2, '3', true], true);
        check(['&&', 1, 2, '3', true, {}], {});
        check(['&&', 1, 2, '3', true, {}, [[0]]], [0]);
      });

      test('returns the first falsy value', () => {
        check(['&&', 1, 1, 0, 1], 0);
        check(['&&', 1, 1, false, 1], false);
        check(['&&', 1, 1, '', 1], '');
        check(['&&', 1, 1, null, 1], null);
        check(['&&', 1, 1, undefined, 1], undefined);
      });

      test('alias works', () => {
        check(['and', ['get', ''], ['get', '']], true, true);
        check(['and', ['get', ''], ['get', '']], false, false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['and', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""&&" operator expects at least two operands."`,
        );
        expect(() => check(['&&', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""&&" operator expects at least two operands."`,
        );
      });
    });

    describe('or or ||', () => {
      test('works with booleans', () => {
        check(['||', true, false], true);
        check(['||', true, true], true);
        check(['||', false, ['get', '']], false, false);
        check(['||', ['get', ''], ['get', '']], true, true);
        check(['||', ['get', ''], ['get', '']], false, false);
      });

      test('variadic form works', () => {
        check(['||', true, true], true);
        check(['||', true, true, true], true);
        check(['||', true, true, true, false], true);
        check(['||', true, false, true, true], true);
        check(['||', false, false, false], false);
        check(['||', true, ['get', ''], true, true], true, false);
      });

      test('returns the first truthy value', () => {
        check(['||', 1, 1], 1);
        check(['||', 1, 0], 1);
        check(['||', 'asdf', ''], 'asdf');
        check(['||', '', ''], '');
        check(['||', 'a', 'b'], 'a');
        check(['||', '', 'b'], 'b');
        check(['||', 0, '', false, null, {}], {});
      });

      test('alias works', () => {
        check(['or', ['get', ''], ['get', '']], true, true);
        check(['or', ['get', ''], ['get', '']], false, false);
        check(['or', ['get', ''], true], true, false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['||', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""||" operator expects at least two operands."`,
        );
        expect(() => check(['or', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""||" operator expects at least two operands."`,
        );
      });
    });

    describe('not or !', () => {
      test('works with booleans', () => {
        check(['!', true], false);
        check(['!', false], true);
      });

      test('casts types to booleans', () => {
        check(['!', 1], false);
        check(['!', 0], true);
        check(['!', ['!', 0]], false);
        check(['!', 'asdf'], false);
        check(['!', ''], true);
        check(['!', null], true);
      });

      test('alias works', () => {
        check(['not', true], false);
        check(['not', false], true);
        check(['not', ['get', '']], true, false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['!', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""!" operator expects 1 operands."`,
        );
        expect(() => check(['not', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""!" operator expects 1 operands."`,
        );
      });
    });
  });

  describe('Type operators', () => {
    describe('type', () => {
      test('returns value type', () => {
        check(['type', true], 'boolean');
        check(['type', ['get', '']], 'boolean', false);
        check(['type', ['get', '']], 'null', null);
        check(['type', ['get', '']], 'number', 123);
        check(['type', ['get', '']], 'number', 123.5);
        check(['type', ['get', '']], 'string', 'abc');
        check(['type', ['get', '']], 'object', {});
        check(['type', ['get', '']], 'array', []);
        check(['type', undefined], 'undefined');
        check(['type', new Uint8Array()], 'binary');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['type', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""type" operator expects 1 operands."`,
        );
      });
    });

    describe('bool', () => {
      test('casts to boolean', () => {
        check(['bool', true], true);
        check(['bool', ['get', '']], false, false);
        check(['bool', ['get', '']], false, null);
        check(['bool', ['get', '']], true, 123);
        check(['bool', ['get', '']], true, 123.5);
        check(['bool', ['get', '']], false, 0);
        check(['bool', ['get', '']], false, 0.0);
        check(['bool', ['get', '']], true, 'abc');
        check(['bool', ['get', '']], false, '');
        check(['bool', ['get', '']], true, {});
        check(['bool', ['get', '']], true, []);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['bool', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""bool" operator expects 1 operands."`,
        );
      });
    });

    describe('num', () => {
      test('casts to number', () => {
        check(['num', true], 1);
        check(['num', ['get', '']], 0, false);
        check(['num', ['get', '']], 0, null);
        check(['num', ['get', '']], 123, 123);
        check(['num', ['get', '']], 123.5, 123.5);
        check(['num', ['get', '']], 0, 0);
        check(['num', ['get', '']], 0, 0.0);
        check(['num', ['get', '']], 0, 'abc');
        check(['num', ['get', '']], 0, '');
        check(['num', ['get', '']], 1, '1');
        check(['num', ['get', '']], 2, '2');
        check(['num', ['get', '']], 4.5, '4.5');
        check(['num', ['get', '']], 0, {});
        check(['num', ['get', '']], 0, []);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['num', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""num" operator expects 1 operands."`,
        );
      });
    });

    describe('str', () => {
      test('casts to number', () => {
        check(['str', true], 'true');
        check(['str', ['get', '']], 'false', false);
        check(['str', ['get', '']], 'null', null);
        check(['str', ['get', '']], '123', 123);
        check(['str', ['get', '']], '123.5', 123.5);
        check(['str', ['get', '']], '0', 0);
        check(['str', ['get', '']], '0', 0.0);
        check(['str', ['get', '']], 'abc', 'abc');
        check(['str', ['get', '']], '', '');
        check(['str', ['get', '']], '1', '1');
        check(['str', ['get', '']], '2', '2');
        check(['str', ['get', '']], '4.5', '4.5');
        check(['str', ['get', '']], '{}', {});
        check(['str', ['get', '']], '[]', []);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['str', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""str" operator expects 1 operands."`,
        );
      });
    });

    describe('len', () => {
      test('returns length of a string', () => {
        check(['len', ''], 0);
        check(['len', 'a'], 1);
        check(['len', ['$', '']], 3, 'abc');
      });

      test('returns length of an array', () => {
        check(['len', [[]]], 0);
        check(['len', [[1]]], 1);
        check(['len', ['$', '']], 3, [2, 2, 2]);
      });

      test('returns number of object entries', () => {
        check(['len', [{}]], 0);
        check(['len', {foo: 'bar'}], 1);
        check(['len', ['$', '']], 3, {a: 1, b: 2, c: 3});
      });

      test('returns length of a binary', () => {
        check(['len', new Uint8Array([])], 0);
        check(['len', new Uint8Array([0])], 1);
        check(['len', ['$', '']], 3, new Uint8Array([1, 2, 3]));
      });

      test('returns for all types that have no length', () => {
        check(['len', null], 0);
        check(['len', undefined], 0);
        check(['len', true], 0);
        check(['len', 123], 0);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['len', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""len" operator expects 1 operands."`,
        );
      });
    });

    describe('und?', () => {
      test('returns true if value is undefined', () => {
        check(['und?', undefined], true);
        // TODO: make this pass...
        // check(['und?', ['$', '']], true, undefined);
      });

      test('returns false if value not undefined', () => {
        check(['und?', 123], false);
        check(['und?', ['$', '']], false, 'lol');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['und?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""und?" operator expects 1 operands."`,
        );
      });
    });

    describe('nil?', () => {
      test('returns true if value is null', () => {
        check(['nil?', null], true);
        check(['nil?', ['$', '']], true, null);
      });

      test('returns false if value not null', () => {
        check(['nil?', 123], false);
        check(['nil?', ['$', '']], false, 'lol');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['nil?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""nil?" operator expects 1 operands."`,
        );
      });
    });

    describe('bool?', () => {
      test('returns true if value is boolean', () => {
        check(['bool?', true], true);
        check(['bool?', ['$', '']], true, false);
      });

      test('returns false if value not boolean', () => {
        check(['bool?', 123], false);
        check(['bool?', ['$', '']], false, 'lol');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['bool?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""bool?" operator expects 1 operands."`,
        );
      });
    });

    describe('num?', () => {
      test('returns true if value is number', () => {
        check(['num?', 0], true);
        check(['num?', ['$', '']], true, 123);
      });

      test('returns false if value not number', () => {
        check(['num?', true], false);
        check(['num?', ['$', '']], false, 'lol');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['num?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""num?" operator expects 1 operands."`,
        );
      });
    });

    describe('str?', () => {
      test('returns true if value is string', () => {
        check(['str?', ''], true);
        check(['str?', ['$', '']], true, '123');
      });

      test('returns false if value not string', () => {
        check(['str?', true], false);
        check(['str?', ['$', '']], false, 123);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['str?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""str?" operator expects 1 operands."`,
        );
      });
    });

    describe('arr?', () => {
      test('returns true if value is array', () => {
        check(['arr?', [[]]], true);
        check(['arr?', ['$', '']], true, [1, true, false]);
      });

      test('returns false if value not array', () => {
        check(['arr?', true], false);
        check(['arr?', ['$', '']], false, 123);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['arr?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""arr?" operator expects 1 operands."`,
        );
      });
    });

    describe('bin?', () => {
      test('returns true if value is binary', () => {
        check(['bin?', [new Uint8Array([])]], true);
        check(['bin?', ['$', '']], true, new Uint8Array([1, 2, 3]));
      });

      test('returns false if value not binary', () => {
        check(['bin?', true], false);
        check(['bin?', ['$', '']], false, 123);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['bin?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""bin?" operator expects 1 operands."`,
        );
      });
    });

    describe('obj?', () => {
      test('returns true if value is object', () => {
        check(['obj?', [{}]], true);
        check(['obj?', ['$', '']], true, {foo: 'bar'});
      });

      test('returns false if value not object', () => {
        check(['obj?', true], false);
        check(['obj?', ['$', '']], false, 123);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['obj?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""obj?" operator expects 1 operands."`,
        );
      });
    });
  });

  describe('String operators', () => {
    describe('car or .', () => {
      test('can concatenate two strings', () => {
        check(['.', 'a', 'b'], 'ab');
        check(['.', 'a', ['get', '']], 'ac', 'c');
      });

      test('long form', () => {
        check(['cat', 'a', 'b'], 'ab');
        check(['cat', 'a', ['get', '']], 'ac', 'c');
      });

      test('variadic form', () => {
        check(['.', 'a', 'b', 'c', 'def'], 'abcdef');
        check(['.', 'a', 'b', 'c', 'def', ['get', '']], 'abcdef!', '!');
      });

      test('casts to string', () => {
        check(['.', '1', true, '!'], '1true!');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['cat', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""." operator expects at least two operands."`,
        );
      });
    });

    describe('contains', () => {
      test('can find a substring', () => {
        check(['contains', 'abc', 'ab'], true);
        check(['contains', 'abc', 'b'], true);
        check(['contains', 'abc', 'c'], true);
      });

      test('returns false on missing substring', () => {
        check(['contains', 'abc', 'g'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['contains', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""contains" operator expects 2 operands."`,
        );
        expect(() => check(['contains', 'a', 'b', 'c'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""contains" operator expects 2 operands."`,
        );
      });
    });

    describe('starts', () => {
      test('can find a substring', () => {
        check(['starts', 'abc', 'ab'], true);
        check(['starts', 'abc', 'a'], true);
        check(['starts', 'abc', 'abc'], true);
        check(['starts', 'abc', 'b'], false);
        check(['starts', 'abc', 'c'], false);
      });

      test('returns false on missing substring', () => {
        check(['starts', 'abc', 'g'], false);
        check(['starts', 'abc', 'aa'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['starts', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""starts" operator expects 2 operands."`,
        );
        expect(() => check(['starts', 'a', 'b', 'c'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""starts" operator expects 2 operands."`,
        );
      });
    });

    describe('ends', () => {
      test('can find a substring', () => {
        check(['ends', 'abc', 'ab'], false);
        check(['ends', 'abc', 'a'], false);
        check(['ends', 'abc', 'b'], false);
        check(['ends', 'abc', 'abc'], true);
        check(['ends', 'abc', 'bc'], true);
        check(['ends', 'abc', 'c'], true);
      });

      test('returns false on missing substring', () => {
        check(['ends', 'abc', 'g'], false);
        check(['ends', 'abc', 'aa'], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['ends', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""ends" operator expects 2 operands."`,
        );
        expect(() => check(['ends', 'a', 'b', 'c'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""ends" operator expects 2 operands."`,
        );
      });
    });

    describe('substr', () => {
      test('computes a substring', () => {
        check(['substr', 'abc', 1, 2], 'b');
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['substr', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""substr" operator expects 3 operands."`,
        );
        expect(() => check(['substr', 'a', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""substr" operator expects 3 operands."`,
        );
        expect(() => check(['substr', 'a', 1, 2, 3] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""substr" operator expects 3 operands."`,
        );
      });
    });

    describe('matches', () => {
      const createPattern = (pattern: string) => {
        const reg = new RegExp(pattern);
        return (value: string) => reg.test(value);
      };

      test('matches a pattern', () => {
        check(['matches', 'abc', 'bc'], true, null, {
          createPattern,
        });
        check(['matches', 'abc', 'bcd'], false, null, {
          createPattern,
        });
      });

      test('pattern must be a literal', () => {
        expect(() =>
          check(['matches', 'abc', ['get', '']], true, 'bc', {
            createPattern,
          }),
        ).toThrowErrorMatchingInlineSnapshot(`""matches" second argument should be a regular expression string."`);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['matches', 'a'] as any, false, null, {createPattern})).toThrowErrorMatchingInlineSnapshot(
          `""matches" operator expects 2 operands."`,
        );
        expect(() =>
          check(['matches', 'a', 'b', 'c'] as any, false, null, {createPattern}),
        ).toThrowErrorMatchingInlineSnapshot(`""matches" operator expects 2 operands."`);
      });
    });

    describe('email?', () => {
      test('returns true for an email', () => {
        check(['email?', 'a@b.c'], true);
        check(['email?', 'vadim@gmail.com'], true);
      });

      test('return false for not email', () => {
        check(['email?', 'abc'], false);
        check(['email?', 123], false);
        check(['email?', true], false);
        check(['email?', null], false);
        check(['email?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['email?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""email?" operator expects 1 operands."`,
        );
      });
    });

    describe('hostname?', () => {
      test('returns true for an hostname', () => {
        check(['hostname?', 'google.com'], true);
        check(['hostname?', 'www.google.com'], true);
        check(['hostname?', 'staging.www.google.com'], true);
        check(['hostname?', 'x.com'], true);
      });

      test('return false for not hostname', () => {
        check(['hostname?', 'abc+'], false);
        check(['hostname?', 123], false);
        check(['hostname?', true], false);
        check(['hostname?', null], false);
        check(['hostname?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['hostname?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""hostname?" operator expects 1 operands."`,
        );
      });
    });

    describe('ip4?', () => {
      test('returns true for an IPv4', () => {
        check(['ip4?', '127.0.1.0'], true);
        check(['ip4?', '255.255.255.255'], true);
      });

      test('return false for not IPv4', () => {
        check(['ip4?', '1.2.3.4.5'], false);
        check(['ip4?', 'abc+'], false);
        check(['ip4?', 123], false);
        check(['ip4?', true], false);
        check(['ip4?', null], false);
        check(['ip4?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['ip4?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""ip4?" operator expects 1 operands."`,
        );
      });
    });

    describe('ip6?', () => {
      test('returns true for an IPv6', () => {
        check(['ip6?', '2001:0db8:0000:0000:0000:ff00:0042:8329'], true);
        check(['ip6?', '2001:db8:0:0:0:ff00:42:8329'], true);
      });

      test('return false for not IPv6', () => {
        check(['ip6?', '1.2.3.4.5'], false);
        check(['ip6?', 'abc+'], false);
        check(['ip6?', 123], false);
        check(['ip6?', true], false);
        check(['ip6?', null], false);
        check(['ip6?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['ip6?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""ip6?" operator expects 1 operands."`,
        );
      });
    });

    describe('uuid?', () => {
      test('returns true for an UUID', () => {
        check(['uuid?', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'], true);
        check(['uuid?', '12345678-aaaa-aaaa-aaaa-ffffffffffff'], true);
      });
      
      test('return false for not UUID', () => {
        check(['uuid?', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa!'], false);
        check(['uuid?', '1.2.3.4.5'], false);
        check(['uuid?', 'abc+'], false);
        check(['uuid?', 123], false);
        check(['uuid?', true], false);
        check(['uuid?', null], false);
        check(['uuid?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['uuid?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""uuid?" operator expects 1 operands."`,
        );
      });
    });

    describe('uri?', () => {
      test('returns true for an URI', () => {
        check(['uri?', 'https://goolge.com/paht?key=value#fragment'], true);
        check(['uri?', 'ftp://www.goolge.com/path'], true);
        check(['uri?', 'http://123.124.125.126'], true);
      });
      
      test('return false for not URI', () => {
        check(['uri?', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa!'], false);
        check(['uri?', '1.2.3.4.5'], false);
        check(['uri?', 'abc+'], false);
        check(['uri?', 123], false);
        check(['uri?', true], false);
        check(['uri?', null], false);
        check(['uri?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['uri?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""uri?" operator expects 1 operands."`,
        );
      });
    });

    describe('duration?', () => {
      test('returns true for an duration', () => {
        check(['duration?', 'P3D'], true);
      });
      
      test('return false for not duration', () => {
        check(['duration?', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa!'], false);
        check(['duration?', '1.2.3.4.5'], false);
        check(['duration?', 'abc+'], false);
        check(['duration?', 123], false);
        check(['duration?', true], false);
        check(['duration?', null], false);
        check(['duration?', undefined], false);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['duration?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""duration?" operator expects 1 operands."`,
        );
      });
    });
  });

  describe('Binary operators', () => {
    describe('u8', () => {
      test('can read from binary', () => {
        check(['u8', new Uint8Array([1, 2, 3]), 0], 1);
        check(['u8', new Uint8Array([1, 2, 3]), 1], 2);
        check(['u8', new Uint8Array([1, 2, 3]), 2], 3);
      });

      test('can read from binary input', () => {
        check(['u8', ['$', ''], 1], 2, new Uint8Array([1, 2, 3]));
      });

      test('throws when reading out of bounds', () => {
        expect(() => check(['u8', new Uint8Array([1, 2, 3]), -1], 0)).toThrowErrorMatchingInlineSnapshot(
          `"OUT_OF_BOUNDS"`,
        );
        expect(() => check(['u8', new Uint8Array([1, 2, 3]), 3], 0)).toThrowErrorMatchingInlineSnapshot(
          `"OUT_OF_BOUNDS"`,
        );
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['u8', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""u8" operator expects 2 operands."`,
        );
        expect(() => check(['u8', 'a', 'b', 'c'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""u8" operator expects 2 operands."`,
        );
      });
    });
  });

  describe('Branching operators', () => {
    describe('if or ?', () => {
      test('branches', () => {
        check(['?', true, 'a', 'b'], 'a');
        check(['if', false, 'a', 'b'], 'b');
      });

      test('branches input values', () => {
        check(['?', ['$', '/0'], ['$', '/1'], ['$', '/2']], 'a', [true, 'a', 'b']);
        check(['?', ['$', '/0'], ['$', '/1'], ['$', '/2']], 'b', [false, 'a', 'b']);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['?', 'a'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""?" operator expects 3 operands."`,
        );
        expect(() => check(['if', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""?" operator expects 3 operands."`,
        );
        expect(() => check(['?', 'a', 'b', 'c', 'd'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""?" operator expects 3 operands."`,
        );
      });
    });

    describe('throw', () => {
      test('can throw specified value', () => {
        try {
          check(['throw', 123], '');
          throw new Error('should not reach here');
        } catch (err) {
          expect((<any>err).value).toBe(123);
        }
      });

      test('can throw specified value, from input', () => {
        try {
          check(['throw', ['get', '']], '', 123);
          throw new Error('should not reach here');
        } catch (err) {
          expect((<any>err).value).toBe(123);
        }
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['throw', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""throw" operator expects 1 operands."`,
        );
      });
    });
  });

  describe('Input operators', () => {
    describe('get or $', () => {
      test('can retrieve root value', () => {
        check(['$', ''], 'a', 'a');
        check(['get', ''], 123, 123);
      });

      test('can retrieve nested value', () => {
        check(['$', '/foo/1'], 2, {foo: [1, 2]});
        check(['get', '/foo/1'], 2, {foo: [1, 2]});
      });

      test('returns default value when destination not found', () => {
        check(['$', '/foo/5', 'miss'], 'miss', {foo: [1, 2]});
        check(['get', '/foo/5', 'miss'], 'miss', {foo: [1, 2]});
      });

      test('pointer can be variable', () => {
        check(['$', ['$', '/foo/0']], ['/foo'], {foo: ['/foo']});
      });

      test('throws when value not found', () => {
        expect(() => check(['$', '/foo/5'], '', {foo: [1, 2]})).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
        expect(() => check(['get', '/foo/5'], '', {foo: [1, 2]})).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['get', 'a', 'b', 'c'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""$" operator expects at most 2 operands."`,
        );
        expect(() => check(['$', 'a', 'b', 'c'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""$" operator expects at most 2 operands."`,
        );
      });
    });

    describe('get? and $?', () => {
      test('can retrieve root value', () => {
        check(['$?', ''], true, 'a');
        check(['get?', ''], true, 123);
      });

      test('can retrieve nested value', () => {
        check(['$?', '/foo/1'], true, {foo: [1, 2]});
        check(['get?', '/foo/1'], true, {foo: [1, 2]});
      });

      test('returns false value when destination not found', () => {
        check(['$?', '/foo/5'], false, {foo: [1, 2]});
        check(['get?', '/foo/5'], false, {foo: [1, 2]});
      });

      test('pointer can be variable', () => {
        check(['$?', ['$', '/foo/0']], true, {foo: ['/foo']});
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['get?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""$?" operator expects 1 operands."`,
        );
        expect(() => check(['$?', 'a', 'b'] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""$?" operator expects 1 operands."`,
        );
      });
    });
  });

  describe('Bitwise operators', () => {
    describe('bitAnd or &', () => {
      test('works with two operands', () => {
        check(['&', 3, 6], 3 & 6);
        check(['bitAnd', 3, 6], 3 & 6);
      });

      test('works with variadic operands', () => {
        check(['&', 3, 6, 12], 3 & 6 & 12);
        check(['bitAnd', 3, 6, 8, 123], 3 & 6 & 8 & 123);
      });

      test('works with side-effects', () => {
        check(['&', 3, 6, ['$', '']], 3 & 6 & 12, 12);
        check(['bitAnd', 3, ['get', '/foo'], 8, 123], 3 & 6 & 8 & 123, {foo: 6});
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['&', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""&" operator expects at least two operands."`,
        );
        expect(() => check(['bitAnd', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""&" operator expects at least two operands."`,
        );
      });
    });

    describe('bitOr or |', () => {
      test('works with two operands', () => {
        check(['|', 3, 6], 3 | 6);
        check(['bitOr', 3, 6], 3 | 6);
      });

      test('works with variadic operands', () => {
        check(['|', 3, 6, 12], 3 | 6 | 12);
        check(['bitOr', 3, 6, 8, 123], 3 | 6 | 8 | 123);
        check(['|', 1, 2, 3], 1 | 2 | 3);
      });

      test('works with side-effects', () => {
        check(['|', 3, 6, ['$', '']], 3 | 6 | 12, 12);
        check(['bitOr', 3, ['get', '/foo'], 8, 123], 3 | 6 | 8 | 123, {foo: 6});
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['|', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""|" operator expects at least two operands."`,
        );
        expect(() => check(['bitOr', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""|" operator expects at least two operands."`,
        );
      });
    });

    describe('bitXor or ^', () => {
      test('works with two operands', () => {
        check(['^', 3, 6], 3 ^ 6);
        check(['bitXor', 3, 6], 3 ^ 6);
      });

      test('works with variadic operands', () => {
        check(['^', 3, 6, 12], 3 ^ 6 ^ 12);
        check(['bitXor', 3, 6, 8, 123], 3 ^ 6 ^ 8 ^ 123);
        check(['^', 1, 2, 3], 1 ^ 2 ^ 3);
      });

      test('works with side-effects', () => {
        check(['^', 3, 6, ['$', '']], 3 ^ 6 ^ 12, 12);
        check(['bitXor', 3, ['get', '/foo'], 8, 123], 3 ^ 6 ^ 8 ^ 123, {foo: 6});
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['^', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""^" operator expects at least two operands."`,
        );
        expect(() => check(['bitXor', 1] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""^" operator expects at least two operands."`,
        );
      });
    });

    describe('bitNot or ~', () => {
      test('works', () => {
        check(['~', 3], ~3);
        check(['~', 12], ~12);
        check(['bitNot', 6], ~6);
      });

      test('throws on invalid operand count', () => {
        expect(() => check(['~', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""~" operator expects 1 operands."`,
        );
        expect(() => check(['bitNot', 1, 2] as any, false)).toThrowErrorMatchingInlineSnapshot(
          `""~" operator expects 1 operands."`,
        );
      });
    });
  });
};
