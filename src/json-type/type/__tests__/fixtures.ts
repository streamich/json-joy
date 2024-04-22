import {TypeOf} from '../../schema';
import {SchemaOf, t} from '..';

export const everyType = t.Object(
  // t.prop('id', t.str.options({noJsonEscape: true})),
  // t.prop('bin', t.bin),
  // t.prop('bool', t.bool),
  // t.prop('nil', t.nil),
  // t.prop('num', t.num),
  // t.prop('str', t.str),
  // t.prop('arr', t.arr),
  // t.prop('obj', t.obj),
  // t.prop('any', t.any),
  t.prop('undef', t.undef),
  // t.prop('const', t.Const(<const>'const')),
  // t.prop('const2', t.Const(<const>2)),
  // t.prop('emptyArray', t.arr.options({max: 0})),
  // t.prop('oneItemArray', t.arr.options({min: 1, max: 1})),
  // t.prop('objWithArray', t.Object(t.propOpt('arr', t.arr), t.propOpt('arr2', t.arr))),
  // t.prop('emptyMap', t.map),
  // t.prop('mapWithOneNumField', t.Map(t.num)),
  // t.prop('mapOfStr', t.Map(t.str)),
);

export const everyTypeValue: TypeOf<SchemaOf<typeof everyType>> = {
  // id: 'asdf',
  // bin: new Uint8Array([1, 2, 3]),
  // bool: true,
  // nil: null,
  // num: 1,
  // str: 'asdf',
  // arr: [1, 2, 3],
  // obj: {},
  // any: 1,
  undef: undefined,
  // const: 'const',
  // const2: 2,
  // emptyArray: [],
  // oneItemArray: [1],
  // objWithArray: {
  //   arr: [1, 2, 3],
  // },
  // emptyMap: {},
  // mapWithOneNumField: {
  //   a: 1,
  // },
  // mapOfStr: {
  //   a: 'a',
  //   b: 'b',
  // },
};
