import {EMPTY, map} from 'rxjs';
import {type TypeOf, s} from '..';

test('can infer a simple "any" type', () => {
  const schema1 = s.any;
  const schema2 = s.Any();
  const schema3 = s.Any({});
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const _val1: T1 = 1;
  const _val2: T2 = 'adf';
  const _val3: T3 = null;
});

test('can infer a simple "undefined" type', () => {
  const schema1 = s.undef;
  type T1 = TypeOf<typeof schema1>;
  const _nil1: T1 = undefined;
});

test('can infer a simple "null" type', () => {
  const schema1 = s.nil;
  const _nil1: TypeOf<typeof schema1> = null;
});

test('can infer a simple "number" type', () => {
  const schema1 = s.num;
  const schema2 = s.Number();
  const schema3 = s.Number({});
  const _num1: TypeOf<typeof schema1> = 1;
  const _num2: TypeOf<typeof schema2> = 2;
  const _num3: TypeOf<typeof schema3> = 3;
});

test('can infer a simple "string" type', () => {
  const schema1 = s.str;
  const schema2 = s.String();
  const schema3 = s.String({});
  const schema4 = s.String({});
  const _str1: TypeOf<typeof schema1> = 'foo';
  const _str2: TypeOf<typeof schema2> = 'bar';
  const _str3: TypeOf<typeof schema3> = 'baz';
  const _str4: TypeOf<typeof schema4> = 'qux';
});

test('can infer a simple "boolean" type', () => {
  const schema1 = s.bool;
  const schema2 = s.Boolean();
  const schema3 = s.Boolean({});
  const schema4 = s.Boolean({});
  const _bool1: TypeOf<typeof schema1> = true;
  const _bool2: TypeOf<typeof schema2> = false;
  const _bool3: TypeOf<typeof schema3> = true;
  const _bool4: TypeOf<typeof schema4> = false;
});

test('can infer a simple "bin" type', () => {
  const schema1 = s.bin;
  const schema2 = s.Binary(s.any);
  const schema3 = s.Binary(s.any, {});
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const _arr1: T1 = new Uint8Array();
  const _arr2: T2 = new Uint8Array([1, 2, 3]);
  const _arr3: T3 = Buffer.allocUnsafe(0);
});

describe('"arr" kind', () => {
  test('can infer a simple "arr" type', () => {
    const schema1 = s.arr;
    const schema2 = s.Array(s.num);
    const schema3 = s.Array(s.str, {});
    type T1 = TypeOf<typeof schema1>;
    type T2 = TypeOf<typeof schema2>;
    type T3 = TypeOf<typeof schema3>;
    const _arr1: T1 = [null];
    const _arr2: T2 = [1, 2, 3];
    const _arr3: T3 = ['foo', 'bar', 'baz'];
  });

  test('can infer head, type, and tail in "arr" type', () => {
    const schema1 = s.Tuple([s.str, s.num], s.str, [s.bool]);
    type T1 = TypeOf<typeof schema1>;
    const _arr1: T1 = ['foo', 1, 'bar', true] satisfies [string, number, ...string[], boolean];
    const _arr2: [string, number, ...string[], boolean] = ['foo', 1, 'bar', true] satisfies T1;
  });

  test('can infer head and type in "arr" type', () => {
    const schema1 = s.Tuple([s.str, s.num], s.str);
    type T1 = TypeOf<typeof schema1>;
    const _arr1: T1 = ['foo', 1, 'bar'] satisfies [string, number, ...string[]];
    const _arr2: [string, number, ...string[]] = ['foo', 1, 'bar'] satisfies T1;
  });

  test('can infer head in "arr" type', () => {
    const schema1 = s.Tuple([s.str, s.num]);
    type T1 = TypeOf<typeof schema1>;
    const _arr1: T1 = ['foo', 1] satisfies [string, number];
    const _arr2: [string, number] = ['foo', 1] satisfies T1;
  });

  test('named tuple members', () => {
    const schema1 = s.Tuple([s.Key('foo', s.str), s.num]);
    type T1 = TypeOf<typeof schema1>;
    const _arr1: T1 = ['foo', 1] satisfies [string, number];
    const _arr2: [string, number] = ['foo', 1] satisfies T1;
  });
});

test('can infer a simple "const" type', () => {
  const schema1 = s.Const(123 as const);
  const schema2 = s.Const('replace' as const, {});
  const schema3 = s.Const(true as const, {});
  const _schema4 = s.Const([1, 2] as const, {});
  const _schema5 = s.Const(123);
  const _schema6 = s.Const('replace');
  const _schema7 = s.Const(true);
  const _schema8 = s.Const([1, 2]);
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const _value1: T1 = 123;
  const _value2: T2 = 'replace';
  const _value3: T3 = true;
});

test('can infer a simple "tuple" type', () => {
  const schema1 = s.Tuple([s.Const('replace' as const), s.str, s.str]);
  type T1 = TypeOf<typeof schema1>;
  const _value1: T1 = ['replace', 'foo', 'bar'];
});

test('can infer a simple "obj" type', () => {
  const schema1 = s.obj;
  const schema2 = s.Object(s.Key('foo', s.str), s.KeyOpt('bar', s.num));
  const schema3 = s.Object({
    keys: <const>[s.Key('bar', s.bool)],
  });
  const schema4 = s.Object([s.Key('baz', s.num), s.KeyOpt('bazOptional', s.bool), s.KeyOpt('z', s.str)], {});
  type _T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  type T4 = TypeOf<typeof schema4>;
  const _obj1: Record<string, never> = {};
  const _obj2: T2 = {foo: 'bar'};
  const _obj3: T3 = {bar: true};
  const _obj4: T4 = {baz: 123, bazOptional: false};
});

test('can infer a "map" type', () => {
  const schema1 = s.map;
  const schema2 = s.Map(s.str);
  const schema3 = s.Map(s.Array(s.num));
  type _T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const _obj1: Record<string, unknown> = {};
  const _obj2: T2 = {foo: 'bar'};
  const _obj3: T3 = {bar: [1, 2, 3]};
});

test('can infer a simple "or" type', () => {
  const schema1 = s.Or(s.str, s.num);
  const schema2 = s.Or(s.str, s.num, s.bool);
  const schema3 = s.Or(s.str, s.num, s.bool, s.nil);
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const _val1: T1 = 'foo';
  const _val2: T1 = 123;
  const _val3: T2 = 1;
  const _val4: T2 = 'a';
  const _val5: T2 = true;
  const _val6: T3 = null;
  const _val7: T3 = false;
  const _val8: T3 = '';
  const _val9: T3 = 0;
});

test('can infer a simple "ref" type', () => {
  const schema1 = s.str;
  const schema2 = s.Object(s.Key('foo', s.Ref<typeof schema1>('another-str')));
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  const _val1: T1 = 'foo';
  const _val2: T2 = {foo: 'bar'};
});

test('can infer a simple "fn" type', () => {
  const req = s.str;
  const res = s.num;
  const schema1 = s.Function(req, res);
  const schema2 = s.fn;
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  const _val1: T1 = async (arg: string) => +arg;
  const _val2: T2 = async (arg: unknown) => arg;
});

test('can infer a simple "fn$" type', () => {
  const req = s.str;
  const res = s.num;
  const schema1 = s.Function$(req, res);
  const schema2 = s.fn$;
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  const _val1: T1 = (arg) => arg.pipe(map((x: string) => +x));
  const _val2: T2 = () => EMPTY;
});

test('can infer a complex "fn" type', () => {
  const arr = s.Array(s.Object(s.Key('op', s.str), s.Key('path', s.str)));
  const req = s.Object(s.Key('id', s.str), s.Key('age', s.num), s.Key('patch', s.Object(s.Key('ops', arr))));
  const res = s.Object(s.Key('id', s.String()));
  const schema1 = s.Function(req, res);
  type T1 = TypeOf<typeof schema1>;
  const _val1: T1 = async ({patch, id}) => {
    const str = patch.ops[0].op + id;
    return {id: str};
  };
});

test('can infer a realistic schema', () => {
  const schema = s.Object(
    s.Key('id', s.str),
    s.Key('age', s.num),
    s.Key('tags', s.Array(s.Or(s.str, s.num))),
    s.Key('data', s.Object(s.Key('foo', s.str), s.Key('bar', s.num))),
    s.Key('approved', s.bool),
    s.Key('meta', s.any),
  );
  type T = TypeOf<typeof schema>;
  const _val: T = {
    id: 'foo',
    age: 18,
    tags: ['baz', 'qux', 5],
    data: {
      foo: 'bar',
      bar: 123,
    },
    approved: true,
    meta: {anything: 'goes'},
  };
});

test('can specify an optional fields', () => {
  const schema = s.Object(s.KeyOpt('meta', s.Object(s.Key('foo', s.str), s.KeyOpt('bar', s.num))));
  type T = TypeOf<typeof schema>;
  const _val0: T = {};
  const _val1: T = {
    meta: {
      foo: 'str',
    },
  };
  const _val2: T = {
    meta: {
      foo: 'str',
      bar: 123,
    },
  };
});
