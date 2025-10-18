import {t} from '..';

test('can print a type', () => {
  const type = t
    .Object(
      t.Key('id', t.str).options({
        description: 'The id of the object',
      }),
      t.Key('tags', t.Array(t.str).options({title: 'Tags'})).options({title: 'Always use tags'}),
      t.KeyOpt('optional', t.any),
      t.Key('booleanProperty', t.bool),
      t.Key('numberProperty', t.num.options({format: 'f64', gt: 3.14})),
      t.Key('binaryProperty', t.bin.options({format: 'cbor'})),
      t.Key('arrayProperty', t.Array(t.any)),
      t.Key('objectProperty', t.Object(t.Key('id', t.str.options({ascii: true, min: 3, max: 128})))),
      t.Key('unionProperty', t.Or(t.str, t.num, t.nil.options({description: ''}))),
      t.KeyOpt('enumAsConst', t.Or(t.Const('a' as const), t.Const('b' as const), t.Const('c' as const))),
      t.KeyOpt('refField', t.Ref('refId')),
      t.KeyOpt('und', t.undef),
      t.Key(
        'operation',
        t.Object(
          t.Key('type', t.Const('replace' as const).options({title: 'Always use replace'})),
          t.Key('path', t.str),
          t.Key('value', t.any),
        ),
      ),
      t.Key(
        'binaryOperation',
        t
          .Binary(
            t
              .Tuple([t.Const(7 as const).options({description: '7 is the magic number'}), t.str, t.any])
              .options({description: 'Should always have 3 elements'}),
          )
          .options({format: 'cbor'}),
      ),
      t.Key('map', t.Map(t.num)),
      t.Key('simpleFn1', t.fn),
      t.Key('simpleFn2', t.fn$),
      t.Key('function', t.Function(t.Object(t.Key('id', t.str)), t.Object(t.Key('name', t.str)))),
    )
    .options({decodeUnknownKeys: true});
  // console.log(type + '');
  expect(type + '').toMatchSnapshot();
});
