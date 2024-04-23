import {t} from '..';

test('can print a type', () => {
  const type = t
    .Object(
      t.prop('id', t.str.options({validator: ['id', 'uuid']})).options({
        description: 'The id of the object',
      }),
      t.prop('tags', t.Array(t.str).options({title: 'Tags'})).options({title: 'Always use tags'}),
      t.propOpt('optional', t.any),
      t.prop('booleanProperty', t.bool),
      t.prop('numberProperty', t.num.options({format: 'f64', gt: 3.14})),
      t.prop('binaryProperty', t.bin.options({format: 'cbor'})),
      t.prop('arrayProperty', t.Array(t.any)),
      t.prop('objectProperty', t.Object(t.prop('id', t.str.options({ascii: true, min: 3, max: 128})))),
      t.prop('unionProperty', t.Or(t.str, t.num, t.nil.options({description: ''}))),
      t.propOpt('enumAsConst', t.Or(t.Const('a' as const), t.Const('b' as const), t.Const('c' as const))),
      t.propOpt('refField', t.Ref('refId')),
      t.propOpt('und', t.undef),
      t.prop(
        'operation',
        t.Object(
          t.prop('type', t.Const('replace' as const).options({title: 'Always use replace'})),
          t.prop('path', t.str),
          t.prop('value', t.any),
        ),
      ),
      t.prop(
        'binaryOperation',
        t
          .Binary(
            t
              .Tuple(t.Const(7 as const).options({description: '7 is the magic number'}), t.str, t.any)
              .options({description: 'Should always have 3 elements'}),
          )
          .options({format: 'cbor'}),
      ),
      t.prop('map', t.Map(t.num)),
      t.prop('simpleFn1', t.fn),
      t.prop('simpleFn2', t.fn$),
      t.prop('function', t.Function(t.Object(t.prop('id', t.str)), t.Object(t.prop('name', t.str)))),
    )
    .options({unknownFields: true});
  // console.log(type + '');
  expect(type + '').toMatchSnapshot();
});
