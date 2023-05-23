import {EMPTY} from 'rxjs';
import {SchemaOf, t} from '..';
import {TypeOf} from '../../schema';

test('const', () => {
  const type = t.Const(<const>42);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = 42;
});

test('undefined', () => {
  const type = t.undef;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = undefined;
});

test('null', () => {
  const type = t.nil;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = null;
});

test('boolean', () => {
  const type = t.bool;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = true;
});

test('number', () => {
  const type = t.num;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = 123;
});

test('string', () => {
  const type = t.str;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = 'abc';
});

test('array', () => {
  const type = t.arr;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = [];
});

test('array', () => {
  const type = t.Tuple(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = [123, 'abc'];
});

test('object', () => {
  const type = t.Object(t.prop('a', t.num), t.prop('b', t.str));
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = {a: 123, b: 'abc'};
});

test('optional field', () => {
  const type = t.Object(t.prop('a', t.num), t.propOpt('b', t.str));
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = {a: 123};
});

test('binary', () => {
  const type = t.bin;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = new Uint8Array();
});

test('ref', () => {
  const alias = t.bin;
  const type = t.Ref<typeof alias>('my-alias');
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v: T = new Uint8Array();
});

test('or', () => {
  const type = t.Or(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const v1: T = 123;
  const v2: T = 'abc';
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
});
