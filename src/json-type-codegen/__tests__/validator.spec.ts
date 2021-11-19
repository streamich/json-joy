import {t} from '../../json-type/type';
import {JsonTypeValidatorCodegen} from '../validator';
import {TType} from '../../json-type/types/json';


const exec = (type: TType, json: unknown, expected: string) => {
  const codegen = new JsonTypeValidatorCodegen();
  const js = codegen.codegen(type);
  console.log(js);
  const fn = eval(js);
  const result = fn(json);

  expect(result).toBe(expected);
};

test('serializes according to schema a POJO object', () => {
  // const type = t.Object({
  //   fields: [
  //     t.Field('a', t.num),
  //     t.Field('b', t.str),
  //     t.Field('c', t.nil),
  //     t.Field('d', t.bool),
  //     t.Field('arr', t.Array(t.Object({
  //       fields: [
  //         t.Field('foo', t.Array(t.num)),
  //         t.Field('.!@#', t.str),
  //       ],
  //     }))),
  //     t.Field('bin', t.bin),
  //   ],
  // });
  // const json = {
  //   a: 1.1,
  //   b: 'sdf',
  //   c: null,
  //   d: true,
  //   arr: [{foo: [1], '.!@#': ''}, {'.!@#': '......', foo: [4, 4, 4.4]}],
  //   bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  // };

  const type = t.bool;
  const json = false;

  exec(type, json, '');
});
