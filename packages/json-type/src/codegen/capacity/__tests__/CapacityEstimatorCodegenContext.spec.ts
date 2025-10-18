import {maxEncodingCapacity} from '@jsonjoy.com/util/lib/json-size';
import {t} from '../../../type';
import {ModuleType} from '../../../type/classes/ModuleType';
import {CapacityEstimatorCodegen} from '../CapacityEstimatorCodegen';
import {Random} from '../../../random';
import {unknown, Value} from '../../../value';

describe('"any" type', () => {
  test('returns the same result as maxEncodingCapacity()', () => {
    const any = t.any;
    const estimator = CapacityEstimatorCodegen.get(any);
    const values = [null, true, false, 1, 123.123, '', 'adsf', [], {}, {foo: 'bar'}, [{a: [{b: null}]}]];
    for (const value of values) expect(estimator(value)).toBe(maxEncodingCapacity(value));
  });

  test('can encode "any" field', () => {
    const type = t.object({foo: t.any});
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({foo: true})).toBe(maxEncodingCapacity({foo: true}));
  });

  test('can encode anon Value<unknown>', () => {
    const type = t.object({foo: t.any});
    const value = unknown('test');
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({foo: value})).toBe(maxEncodingCapacity({foo: value.data}));
  });

  test('can encode typed Value<T>', () => {
    const type = t.object({foo: t.any});
    const value = new Value(123, t.con(123));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({foo: value})).toBe(maxEncodingCapacity({foo: value.data}));
  });
});

describe('"con" type', () => {
  test('returns exactly the same size as maxEncodingCapacity()', () => {
    const system = new ModuleType();
    const type = system.t.Const({foo: [123]});
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(null)).toBe(maxEncodingCapacity({foo: [123]}));
  });
});

describe('"nil" type', () => {
  test('returns exactly the same size as maxEncodingCapacity()', () => {
    const system = new ModuleType();
    const type = system.t.nil;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(null)).toBe(maxEncodingCapacity(null));
  });
});

describe('"bool" type', () => {
  test('returns 5', () => {
    const system = new ModuleType();
    const type = system.t.bool;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(null)).toBe(5);
  });
});

describe('"num" type', () => {
  test('returns 22', () => {
    const system = new ModuleType();
    const type = system.t.num;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(null)).toBe(22);
  });
});

describe('"str" type', () => {
  test('empty string', () => {
    const system = new ModuleType();
    const type = system.t.str;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator('')).toBe(maxEncodingCapacity(''));
  });

  test('short string', () => {
    const system = new ModuleType();
    const type = system.t.str;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator('asdf')).toBe(maxEncodingCapacity('asdf'));
  });
});

describe('"bin" type', () => {
  test('empty', () => {
    const system = new ModuleType();
    const type = system.t.bin;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(new Uint8Array())).toBe(maxEncodingCapacity(new Uint8Array()));
  });

  test('small buffer', () => {
    const system = new ModuleType();
    const type = system.t.bin;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(new Uint8Array([1, 2, 3]))).toBe(maxEncodingCapacity(new Uint8Array([1, 2, 3])));
  });
});

describe('"arr" type', () => {
  test('empty', () => {
    const type = t.arr;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([])).toBe(maxEncodingCapacity([]));
  });

  test('"con" elements', () => {
    const type = t.Array(t.con('abc'));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([])).toBe(maxEncodingCapacity([]));
    expect(estimator(['abc'])).toBe(maxEncodingCapacity(['abc']));
    expect(estimator(['abc', 'abc'])).toBe(maxEncodingCapacity(['abc', 'abc']));
  });

  test('simple elements', () => {
    const system = new ModuleType();
    const type = system.t.arr;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, true, 'asdf'])).toBe(maxEncodingCapacity([1, true, 'asdf']));
  });

  test('typed array, optimizes computation', () => {
    const system = new ModuleType();
    const type = system.t.Array(system.t.num);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, 2, 3])).toBe(maxEncodingCapacity([1, 2, 3]));
  });

  test('array of strings', () => {
    const system = new ModuleType();
    const type = system.t.Array(system.t.str);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['a', 'asdf'])).toBe(maxEncodingCapacity(['a', 'asdf']));
  });

  test('empty', () => {
    const system = new ModuleType();
    const type = system.t.tuple();
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([])).toBe(maxEncodingCapacity([]));
  });

  test('two elements', () => {
    const system = new ModuleType();
    const type = system.t.tuple(system.t.num, system.t.str);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, 'asdf'])).toBe(maxEncodingCapacity([1, 'asdf']));
  });

  test('head 2-tuple', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Const('abc'), t.Const('xxxxxxxxx')], t.num);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['abc', 'xxxxxxxxx', 1])).toBe(maxEncodingCapacity(['abc', 'xxxxxxxxx', 1]));
  });

  test('tail 2-tuple', () => {
    const system = new ModuleType();
    const type = system.t.Array(t.num).tail(t.str, t.str);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, 'abc', 'xxxxxxxxx'])).toBe(maxEncodingCapacity([1, 'abc', 'xxxxxxxxx']));
  });

  test('named tail 2-tuple', () => {
    const system = new ModuleType();
    const type = system.t.Array(t.num).tail(t.Key('very_important', t.str), t.str);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, 'abc', 'xxxxxxxxx'])).toBe(maxEncodingCapacity([1, 'abc', 'xxxxxxxxx']));
  });

  test('named head 2-tuple', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Key('first', t.Const('abc')), t.Key('second', t.Const('xxxxxxxxx'))], t.num);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['abc', 'xxxxxxxxx', 1])).toBe(maxEncodingCapacity(['abc', 'xxxxxxxxx', 1]));
  });

  test('mixed head and tail tuple', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Const('start')], t.str).tail(t.Const('end'));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['start', 'middle1', 'middle2', 'end'])).toBe(
      maxEncodingCapacity(['start', 'middle1', 'middle2', 'end']),
    );
  });

  test('complex named tail tuple', () => {
    const system = new ModuleType();
    const type = system.t
      .Array(t.num)
      .tail(t.Key('status', t.str), t.Key('timestamp', t.num), t.Key('metadata', t.bool));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, 2, 3, 'success', 1234567890, true])).toBe(
      maxEncodingCapacity([1, 2, 3, 'success', 1234567890, true]),
    );
  });

  test('empty array with head/tail definition', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Const('required')], t.str).tail(t.Const('end'));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['required', 'end'])).toBe(maxEncodingCapacity(['required', 'end']));
  });

  test('head tuple with different types', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Key('id', t.num), t.Key('name', t.str), t.Key('active', t.bool)], t.str);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([42, 'test', true, 'extra1', 'extra2'])).toBe(
      maxEncodingCapacity([42, 'test', true, 'extra1', 'extra2']),
    );
  });

  test('tail tuple with different types', () => {
    const system = new ModuleType();
    const type = system.t.Array(t.str).tail(t.Key('count', t.num), t.Key('valid', t.bool));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['item1', 'item2', 'item3', 5, true])).toBe(
      maxEncodingCapacity(['item1', 'item2', 'item3', 5, true]),
    );
  });

  test('nested objects in named tuples', () => {
    const system = new ModuleType();
    const type = system.t
      .Array(t.Object(t.Key('value', t.num)))
      .tail(t.Key('summary', t.Object(t.Key('total', t.num), t.Key('average', t.num))));
    const estimator = CapacityEstimatorCodegen.get(type);
    const data = [
      {value: 10},
      {value: 20},
      {total: 30, average: 15}, // summary
    ];
    expect(estimator(data)).toBe(maxEncodingCapacity(data));
  });

  test('single element named tail', () => {
    const system = new ModuleType();
    const type = system.t.Array(t.num).tail(t.Key('final', t.str));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator([1, 2, 3, 'done'])).toBe(maxEncodingCapacity([1, 2, 3, 'done']));
  });

  test('single element named head', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Key('header', t.str)], t.num);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['header', 1, 2, 3])).toBe(maxEncodingCapacity(['header', 1, 2, 3]));
  });

  test('both head and tail with same type', () => {
    const system = new ModuleType();
    const type = system.t.Tuple([t.Key('start', t.str)], t.num).tail(t.Key('end', t.str));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(['begin', 1, 2, 3, 'finish'])).toBe(maxEncodingCapacity(['begin', 1, 2, 3, 'finish']));
  });
});

describe('"obj" type', () => {
  test('empty', () => {
    const system = new ModuleType();
    const type = system.t.obj;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(123)).toBe(maxEncodingCapacity({}));
  });

  test('object with unknown fields', () => {
    const system = new ModuleType();
    const type = system.t.obj.options({encodeUnknownKeys: true});
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({foo: 'bar'})).toBe(maxEncodingCapacity({foo: 'bar'}));
  });

  test('one required key', () => {
    const system = new ModuleType();
    const type = system.t.Object(system.t.Key('abc', system.t.str));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({abc: 'foo'})).toBe(maxEncodingCapacity({abc: 'foo'}));
  });

  test('one required and one optional keys', () => {
    const system = new ModuleType();
    const type = system.t.Object(system.t.Key('abc', system.t.str), system.t.KeyOpt('key', system.t.num));
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({abc: 'foo', key: 111})).toBe(maxEncodingCapacity({abc: 'foo', key: 111}));
  });
});

describe('"map" type', () => {
  test('empty', () => {
    const system = new ModuleType();
    const type = system.t.map;
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(123)).toBe(maxEncodingCapacity({}));
  });

  test('with one field', () => {
    const system = new ModuleType();
    const type = system.t.Map(system.t.bool);
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator({foo: true})).toBe(maxEncodingCapacity({foo: true}));
  });

  test('three number fields', () => {
    const system = new ModuleType();
    const type = system.t.Map(system.t.num);
    const estimator = CapacityEstimatorCodegen.get(type);
    const data = {foo: 1, bar: 2, baz: 3};
    expect(estimator(data)).toBe(maxEncodingCapacity(data));
  });

  test('nested maps', () => {
    const system = new ModuleType();
    const type = system.t.Map(system.t.Map(system.t.str));
    const estimator = CapacityEstimatorCodegen.get(type);
    const data = {foo: {bar: 'baz'}, baz: {bar: 'foo'}};
    expect(estimator(data)).toBe(maxEncodingCapacity(data));
  });
});

describe('"ref" type', () => {
  test('two hops', () => {
    const system = new ModuleType();
    system.alias('Id', system.t.str);
    system.alias('User', system.t.Object(system.t.Key('id', system.t.Ref('Id')), system.t.Key('name', system.t.str)));
    const type = system.t.Ref('User');
    const value = {id: 'asdf', name: 'foo'};
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator(value)).toBe(maxEncodingCapacity(value));
  });
});

describe('"or" type', () => {
  test('empty', () => {
    const system = new ModuleType();
    const type = system.t.Or(system.t.str, system.t.arr).options({
      discriminator: [
        'if',
        ['==', 'string', ['type', ['get', '']]],
        0,
        ['if', ['==', 'array', ['type', ['get', '']]], 1, -1],
      ],
    });
    const estimator = CapacityEstimatorCodegen.get(type);
    expect(estimator('asdf')).toBe(maxEncodingCapacity('asdf'));
    expect(estimator([1, 2, 3])).toBe(maxEncodingCapacity([1, 2, 3]));
  });
});

test('add circular reference test', () => {
  const system = new ModuleType();
  const {t} = system;
  const user = system.alias('User', t.Object(t.Key('id', t.str), t.KeyOpt('address', t.Ref('Address'))));
  const _address = system.alias('Address', t.Object(t.Key('id', t.str), t.KeyOpt('user', t.Ref('User'))));
  const value1 = {
    id: 'user-1',
    address: {
      id: 'address-1',
      user: {
        id: 'user-2',
        address: {
          id: 'address-2',
          user: {
            id: 'user-3',
          },
        },
      },
    },
  };
  const estimator = CapacityEstimatorCodegen.get(user.type);
  expect(estimator(value1)).toBe(maxEncodingCapacity(value1));
});

test('fuzzer: map in map', () => {
  const system = new ModuleType();
  const {t} = system;
  const type = t.Map(t.Map(t.nil));
  const estimator = CapacityEstimatorCodegen.get(type);
  for (let i = 0; i < 100; i++) {
    const value = Random.gen(type);
    expect(estimator(value)).toBe(maxEncodingCapacity(value));
  }
});
