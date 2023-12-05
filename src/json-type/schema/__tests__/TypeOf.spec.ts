import {EMPTY, map} from 'rxjs';
import {s, TypeOf} from '..';

test('can infer a simple "any" type', () => {
  const schema1 = s.any;
  const schema2 = s.Any();
  const schema3 = s.Any({});
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const val1: T1 = 1;
  const val2: T2 = 'adf';
  const val3: T3 = null;
});

test('can infer a simple "undefined" type', () => {
  const schema1 = s.undef;
  type T1 = TypeOf<typeof schema1>;
  const nil1: T1 = undefined;
});

test('can infer a simple "null" type', () => {
  const schema1 = s.nil;
  const nil1: TypeOf<typeof schema1> = null;
});

test('can infer a simple "number" type', () => {
  const schema1 = s.num;
  const schema2 = s.Number();
  const schema3 = s.Number({});
  const num1: TypeOf<typeof schema1> = 1;
  const num2: TypeOf<typeof schema2> = 2;
  const num3: TypeOf<typeof schema3> = 3;
});

test('can infer a simple "string" type', () => {
  const schema1 = s.str;
  const schema2 = s.String();
  const schema3 = s.String({});
  const schema4 = s.String('id', {});
  const str1: TypeOf<typeof schema1> = 'foo';
  const str2: TypeOf<typeof schema2> = 'bar';
  const str3: TypeOf<typeof schema3> = 'baz';
  const str4: TypeOf<typeof schema4> = 'qux';
});

test('can infer a simple "boolean" type', () => {
  const schema1 = s.bool;
  const schema2 = s.Boolean();
  const schema3 = s.Boolean({});
  const schema4 = s.Boolean('id', {});
  const bool1: TypeOf<typeof schema1> = true;
  const bool2: TypeOf<typeof schema2> = false;
  const bool3: TypeOf<typeof schema3> = true;
  const bool4: TypeOf<typeof schema4> = false;
});

test('can infer a simple "binary" type', () => {
  const schema1 = s.bin;
  const schema2 = s.Binary(s.any);
  const schema3 = s.Binary(s.any, {});
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const arr1: T1 = new Uint8Array();
  const arr2: T2 = new Uint8Array([1, 2, 3]);
  const arr3: T3 = Buffer.allocUnsafe(0);
});

test('can infer a simple "array" type', () => {
  const schema1 = s.arr;
  const schema2 = s.Array(s.num);
  const schema3 = s.Array(s.str, {});
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const arr1: T1 = [null];
  const arr2: T2 = [1, 2, 3];
  const arr3: T3 = ['foo', 'bar', 'baz'];
});

test('can infer a simple "const" type', () => {
  const schema1 = s.Const(123 as const);
  const schema2 = s.Const('replace' as const, {});
  const schema3 = s.Const(true as const, {});
  const schema4 = s.Const([1, 2] as const, {});
  const schema5 = s.Const(123);
  const schema6 = s.Const('replace');
  const schema7 = s.Const(true);
  const schema8 = s.Const([1, 2]);
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const value1: T1 = 123;
  const value2: T2 = 'replace';
  const value3: T3 = true;
});

test('can infer a simple "tuple" type', () => {
  const schema1 = s.Tuple(s.Const('replace' as const), s.str, s.str);
  type T1 = TypeOf<typeof schema1>;
  const value1: T1 = ['replace', 'foo', 'bar'];
});

test('can infer a simple object type', () => {
  const schema1 = s.obj;
  const schema2 = s.Object(s.prop('foo', s.str), s.propOpt('bar', s.num));
  const schema3 = s.Object({
    fields: <const>[s.prop('bar', s.bool)],
  });
  const schema4 = s.Object([s.prop('baz', s.num), s.propOpt('bazOptional', s.bool), s.propOpt('z', s.str)], {});
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  type T4 = TypeOf<typeof schema4>;
  const obj1: Record<string, never> = {};
  const obj2: T2 = {foo: 'bar'};
  const obj3: T3 = {bar: true};
  const obj4: T4 = {baz: 123, bazOptional: false};
});

test('can infer a map type', () => {
  const schema1 = s.map;
  const schema2 = s.Map(s.str);
  const schema3 = s.Map(s.Array(s.num));
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const obj1: Record<string, unknown> = {};
  const obj2: T2 = {foo: 'bar'};
  const obj3: T3 = {bar: [1, 2, 3]};
});

test('can infer a simple union type', () => {
  const schema1 = s.Or(s.str, s.num);
  const schema2 = s.Or(s.str, s.num, s.bool);
  const schema3 = s.Or(s.str, s.num, s.bool, s.nil);
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  type T3 = TypeOf<typeof schema3>;
  const val1: T1 = 'foo';
  const val2: T1 = 123;
  const val3: T2 = 1;
  const val4: T2 = 'a';
  const val5: T2 = true;
  const val6: T3 = null;
  const val7: T3 = false;
  const val8: T3 = '';
  const val9: T3 = 0;
});

test('can infer a simple "ref" type', () => {
  const schema1 = s.str;
  const schema2 = s.Object(s.prop('foo', s.Ref<typeof schema1>('another-str')));
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  const val1: T1 = 'foo';
  const val2: T2 = {foo: 'bar'};
});

test('can infer a simple "fn" type', () => {
  const req = s.str;
  const res = s.num;
  const schema1 = s.Function(req, res);
  const schema2 = s.fn;
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  const val1: T1 = async (arg: string) => +arg;
  const val2: T2 = async (arg: unknown) => arg;
});

test('can infer a simple "fn$" type', () => {
  const req = s.str;
  const res = s.num;
  const schema1 = s.Function$(req, res);
  const schema2 = s.fn$;
  type T1 = TypeOf<typeof schema1>;
  type T2 = TypeOf<typeof schema2>;
  const val1: T1 = (arg) => arg.pipe(map((x: string) => +x));
  const val2: T2 = () => EMPTY;
});

test('can infer a complex "fn" type', () => {
  const req = s.Object(
    s.prop('id', s.str),
    s.prop('age', s.num),
    s.prop('patch', s.Object(s.prop('ops', s.Array(s.Object(s.prop('op', s.str), s.prop('path', s.str)))))),
  );
  const res = s.Object(s.prop('id', s.String()));
  const schema1 = s.Function(req, res);
  type T1 = TypeOf<typeof schema1>;
  const val1: T1 = async ({patch, id}) => {
    const str = patch.ops[0].op + id;
    return {id: str};
  };
});

test('can infer a realistic schema', () => {
  const schema = s.Object(
    s.prop('id', s.str),
    s.prop('age', s.num),
    s.prop('tags', s.Array(s.Or(s.str, s.num))),
    s.prop('data', s.Object(s.prop('foo', s.str), s.prop('bar', s.num))),
    s.prop('approved', s.bool),
    s.prop('meta', s.any),
  );
  type T = TypeOf<typeof schema>;
  const val: T = {
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
  const schema = s.Object(s.propOpt('meta', s.Object(s.prop('foo', s.str), s.propOpt('bar', s.num))));
  type T = TypeOf<typeof schema>;
  const val0: T = {};
  const val1: T = {
    meta: {
      foo: 'str',
    },
  };
  const val2: T = {
    meta: {
      foo: 'str',
      bar: 123,
    },
  };
});
