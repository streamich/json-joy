import {EMPTY} from 'rxjs';
import {type SchemaOf, t} from '..';
import type {TypeOf} from '../../schema';

test('const', () => {
  const type = t.Const(<const>42);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = 42;
});

test('undefined', () => {
  const type = t.undef;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = undefined;
});

test('null', () => {
  const type = t.nil;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = null;
});

test('boolean', () => {
  const type = t.bool;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = true;
});

test('number', () => {
  const type = t.num;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = 123;
});

test('string', () => {
  const type = t.str;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = 'abc';
});

describe('"arr" type', () => {
  test('default array', () => {
    const type = t.arr;
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [] satisfies unknown[];
  });

  test('2-tuple', () => {
    const type = t.Tuple([t.num, t.str]);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [123, 'abc'];
    // @ts-expect-error
    const _v2: T = [123, 'abc', 1];
  });

  test('named 2-tuple', () => {
    const type = t.Tuple([t.num, t.Key('id', t.str)]);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [123, 'abc'];
    // @ts-expect-error
    const _v2: T = [123, 'abc', 1];
  });

  test('2-tuple using shorthand', () => {
    const type = t.tuple(t.num, t.str);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [123, 'abc'];
    // @ts-expect-error
    const _v2: T = [123, 'abc', 1];
  });

  test('2-tuple with item type', () => {
    const type = t.Tuple([t.num, t.str], t.bool);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [123, 'abc'];
    const _v2: T = [123, 'abc', true];
    const _v3: T = [123, 'abc', true, false];
    // @ts-expect-error
    const _v4: T = [123, 'abc', 1];
  });

  test('2-tuple tail with item type', () => {
    const type = t.Tuple([], t.bool, [t.num, t.str]);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [true, 123, 'abc'];
    const _v2: T = [false, true, 123, 'abc'];
    const _v3: T = [123, 'abc'];
    // @ts-expect-error
    const _v4: T = [123, 'abc', 1];
  });

  test('2-tuple head & tail with item type', () => {
    const type = t.Tuple([t.con(false), t.nil], t.bool, [t.num, t.str]);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v1: T = [false, null, true, 123, 'abc'];
    const _v2: T = [false, null, false, true, 123, 'abc'];
    const _v3: T = [false, null, 123, 'abc'];
    // @ts-expect-error
    const _v4: T = [123, 'abc', 1];
  });
});

test('object', () => {
  const type = t.Object(t.Key('a', t.num), t.Key('b', t.str));
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = {a: 123, b: 'abc'};
});

test('optional field', () => {
  const type = t.Object(t.Key('a', t.num), t.KeyOpt('b', t.str));
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = {a: 123};
});

test('binary', () => {
  const type = t.bin;
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = new Uint8Array();
});

test('ref', () => {
  const alias = t.bin;
  const type = t.Ref<typeof alias>('my-alias');
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v: T = new Uint8Array();
});

test('or', () => {
  const type = t.Or(t.num, t.str);
  type S = SchemaOf<typeof type>;
  type T = TypeOf<S>;
  const _v1: T = 123;
  const _v2: T = 'abc';
});

describe('fn', () => {
  test('fn', () => {
    const type = t.Function(t.num, t.str);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v: T = async (arg: number) => 'abc';
  });

  test('no input and no output', () => {
    const type = t.Function(t.undef, t.undef);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v: T = async () => {};
  });

  test('fn$', () => {
    const type = t.Function$(t.num, t.str);
    type S = SchemaOf<typeof type>;
    type T = TypeOf<S>;
    const _v: T = (arg) => EMPTY;
  });
});

test('string patch', () => {
  const StringOperationInsert = t.tuple(t.con(1), t.str).options({
    title: 'Insert String',
    description: 'Inserts a string at the current position in the source string.',
  });
  const StringOperationEqual = t.tuple(t.con(0), t.str).options({
    title: 'Equal String',
    description: 'Keeps the current position in the source string unchanged.',
  });
  const StringOperationDelete = t.tuple(t.con(-1), t.str).options({
    title: 'Delete String',
    description: 'Deletes the current position in the source string.',
  });
  const StringPatch = t
    .array(t.or(StringOperationInsert, StringOperationEqual, StringOperationDelete))
    .title('String Patch')
    .description(
      'A list of string operations that can be applied to a source string to produce a destination string, or vice versa.',
    );

  type T = t.infer<typeof StringPatch>;
  const _v: T = [
    [1, 'Hello'],
    [0, 'World'],
    [-1, '!'],
  ];
  const _v2: T = [
    // @ts-expect-error
    [2, 'Test'],
  ];
});
