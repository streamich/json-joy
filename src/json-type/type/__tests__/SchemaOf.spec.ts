import {EMPTY} from 'rxjs';
import {SchemaOf, t} from '..';
import {TypeOf} from '../../schema';

test('const', () => {
  const type = t.Const(<const>42);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = 42;
  String(v);
});

test('undefined', () => {
  const type = t.undef;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = undefined;
  String(v);
});

test('null', () => {
  const type = t.nil;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = null;
  String(v);
});

test('boolean', () => {
  const type = t.bool;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = true;
  String(v);
});

test('number', () => {
  const type = t.num;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = 123;
  String(v);
});

test('string', () => {
  const type = t.str;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = 'abc';
  String(v);
});

test('array', () => {
  const type = t.arr;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = [];
  String(v);
});

test('array', () => {
  const type = t.Tuple(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = [123, 'abc'];
  String(v);
});

test('object', () => {
  const type = t.Object(t.prop('a', t.num), t.prop('b', t.str));
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = {a: 123, b: 'abc'};
  String(v);
});

test('optional field', () => {
  const type = t.Object(t.prop('a', t.num), t.propOpt('b', t.str));
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = {a: 123};
  String(v);
});

test('binary', () => {
  const type = t.bin;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = new Uint8Array();
  String(v);
});

test('ref', () => {
  const alias = t.bin;
  const type = t.Ref<typeof alias>('my-alias');
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = new Uint8Array();
  String(v);
});

test('or', () => {
  const type = t.Or(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v1: T = 123;
  const v2: T = 'abc';
  String(v1);
  String(v2);
});

test('fn', () => {
  const type = t.Function(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = async (arg: number) => 'abc';
});

test('fn$', () => {
  const type = t.Function$(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = (arg) => EMPTY;
  String(v);
});
