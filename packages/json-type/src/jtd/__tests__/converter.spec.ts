import {toJtdForm} from '..';
import {t} from '../../index';

describe('JTD converter', () => {
  test('string type', () => {
    const stringType = t.str;
    const jtdForm = toJtdForm(stringType);
    expect(jtdForm).toEqual({type: 'string'});
  });

  test('number type with format', () => {
    const numberType = t.num.options({format: 'u8'});
    const jtdForm = toJtdForm(numberType);
    expect(jtdForm).toEqual({type: 'uint8'});
  });

  test('boolean type', () => {
    const boolType = t.bool;
    const jtdForm = toJtdForm(boolType);
    expect(jtdForm).toEqual({type: 'boolean'});
  });

  test('const type with string value', () => {
    const constType = t.Const('hello');
    const jtdForm = toJtdForm(constType);
    expect(jtdForm).toEqual({type: 'string'});
  });

  test('const type with number value', () => {
    const constType = t.Const(255);
    const jtdForm = toJtdForm(constType);
    expect(jtdForm).toEqual({type: 'uint8'});
  });

  test('any type', () => {
    const anyType = t.any;
    const jtdForm = toJtdForm(anyType);
    expect(jtdForm).toEqual({nullable: true});
  });

  test('array type', () => {
    const arrayType = t.Array(t.str);
    const jtdForm = toJtdForm(arrayType);
    expect(jtdForm).toEqual({
      elements: {type: 'string'},
    });
  });

  test('object type', () => {
    const objectType = t.Object(t.Key('name', t.str), t.KeyOpt('age', t.num));
    const jtdForm = toJtdForm(objectType);
    expect(jtdForm).toEqual({
      properties: {
        name: {type: 'string'},
      },
      optionalProperties: {
        age: {type: 'float64'},
      },
    });
  });
});
