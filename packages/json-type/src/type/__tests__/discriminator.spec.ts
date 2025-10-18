import {t} from '..';
import {ValidatorCodegen} from '../../codegen/validator/ValidatorCodegen';
import {Discriminator} from '../discriminator';

describe('Discriminator', () => {
  test('can find const discriminator at root node', () => {
    const t1 = t.Const('foo');
    const t2 = t.Const(123);
    const t3 = t.Const([true, false]);
    const d1 = Discriminator.find(t1);
    const d2 = Discriminator.find(t2);
    const d3 = Discriminator.find(t3);
    expect(d1!.toSpecifier()).toBe('["","con","foo"]');
    expect(d2!.toSpecifier()).toBe('["","con",123]');
    expect(d3!.toSpecifier()).toBe('["","con",[true,false]]');
  });

  test('can find const discriminator in a tuple', () => {
    const t1 = t.tuple(t.Const('foo'));
    const t2 = t.tuple(t.Const('add'), t.str, t.any);
    const t3 = t.tuple(t.map, t.obj, t.Const(null), t.num);
    const d1 = Discriminator.find(t1);
    const d2 = Discriminator.find(t2);
    const d3 = Discriminator.find(t3);
    expect(d1!.toSpecifier()).toBe('["/0","con","foo"]');
    expect(d2!.toSpecifier()).toBe('["/0","con","add"]');
    expect(d3!.toSpecifier()).toBe('["/2","con",null]');
  });

  test('can find const discriminator in a object', () => {
    const t1 = t.Object(t.Key('op', t.Const('replace')), t.Key('value', t.num), t.Key('path', t.str));
    const d1 = Discriminator.find(t1);
    expect(d1!.toSpecifier()).toBe('["/op","con","replace"]');
  });

  test('uses node type as discriminator, if not const', () => {
    const t1 = t.Map(t.str);
    const t2 = t.obj;
    const t3 = t.str;
    const d1 = Discriminator.find(t1);
    const d2 = Discriminator.find(t2);
    const d3 = Discriminator.find(t3);
    expect(d1!.toSpecifier()).toBe('["","obj",0]');
    expect(d2!.toSpecifier()).toBe('["","obj",0]');
    expect(d3!.toSpecifier()).toBe('["","str",0]');
  });

  test('can find const node in nested fields', () => {
    const t1 = t.tuple(t.str, t.tuple(t.num, t.Const('foo')));
    const t2 = t.Object(t.Key('type', t.tuple(t.Const(25), t.str, t.any)), t.Key('value', t.num));
    const d1 = Discriminator.find(t1);
    const d2 = Discriminator.find(t2);
    // const d3 = Discriminator.find(t3);
    expect(d1!.toSpecifier()).toBe('["/1/1","con","foo"]');
    expect(d2!.toSpecifier()).toBe('["/type/0","con",25]');
  });
});

describe('OrType', () => {
  test('can automatically infer discriminator', () => {
    const or = t.Or(t.str, t.num);
    const validator = ValidatorCodegen.get({type: or, errors: 'boolean'});
    expect(validator('str')).toBe(false);
    expect(validator(123)).toBe(false);
    expect(validator(true)).toBe(true);
    expect(validator(false)).toBe(true);
    expect(validator(null)).toBe(true);
    expect(validator({})).toBe(true);
    expect(validator([])).toBe(true);
  });

  test('can automatically infer discriminator in objects', () => {
    const or = t.Or(
      t.Object(t.Key('op', t.Const('replace')), t.Key('path', t.str), t.Key('value', t.any)),
      t.Object(t.Key('op', t.Const('add')), t.Key('path', t.str), t.Key('value', t.any)),
      t.Object(t.Key('op', t.Const('test')), t.Key('path', t.str), t.Key('value', t.any)),
      t.Object(t.Key('op', t.Const('move')), t.Key('path', t.str), t.Key('from', t.str)),
      t.Object(t.Key('op', t.Const('copy')), t.Key('path', t.str), t.Key('from', t.str)),
      t.Object(t.Key('op', t.Const('remove')), t.Key('path', t.str)),
    );
    const validator = ValidatorCodegen.get({type: or, errors: 'boolean'});
    expect(validator({op: 'replace', path: '/foo', value: 123})).toBe(false);
    expect(validator({op: 'add', path: '/f/o/o', value: {foo: 'bar'}})).toBe(false);
    expect(validator({op: 'test', path: '/abc', value: []})).toBe(false);
    expect(validator({op: 'move', path: '/abc', from: '/xyz'})).toBe(false);
    expect(validator({op: 'copy', path: '/abc', from: '/xyz'})).toBe(false);
    expect(validator({op: 'remove', path: '/abc'})).toBe(false);
    expect(validator({op: 'replace2', path: '/foo', value: 123})).toBe(true);
    expect(validator({op: 'add', path: 123, value: {foo: 'bar'}})).toBe(true);
    expect(validator({op: 'test', path: '/abc'})).toBe(true);
    expect(validator({op: 'move', path: ['/abc'], from: '/xyz'})).toBe(true);
    expect(validator({op: 'copy', path: '/abc', fromd: '/xyz'})).toBe(true);
    expect(validator({op: 'remove', path: '/abc', from: '/sdf'})).toBe(true);
    expect(validator([])).toBe(true);
    expect(validator({})).toBe(true);
    expect(validator(123)).toBe(true);
  });
});
