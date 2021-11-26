import {JsonExpressionCodegen} from '../codegen';
import {Expr} from '../types';

const check = (expression: Expr, expected: unknown, data: unknown = null) => {
  const codegen = new JsonExpressionCodegen({
    expression,
  });
  const fn = codegen.run().compile();
  // console.log(codegen.generate().js);
  // console.log(fn.toString());
  const result = fn({data});
  expect(result).toStrictEqual(expected);
};

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

describe('defined', () => {
  test('accepts only one operand', () => {
    const callback = () => check(['defined', '/foo', '/bar'] as any, true, {foo: 123});
    expect(callback).toThrowError(new Error('Defined operator expects one operand.'));
  });

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
