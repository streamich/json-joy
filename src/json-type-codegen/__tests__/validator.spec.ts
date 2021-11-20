import {t} from '../../json-type/type';
import {JsonTypeValidatorCodegen} from '../validator';
import {TType} from '../../json-type/types/json';

const exec = (type: TType, json: unknown, expected: string) => {
  const codegen1 = new JsonTypeValidatorCodegen({errorReporting: 'object'});
  const codegen2 = new JsonTypeValidatorCodegen({errorReporting: 'boolean'});
  const codegen3 = new JsonTypeValidatorCodegen({errorReporting: 'boolean', skipObjectExtraFieldsCheck: true});

  const js1 = codegen1.codegen(type);
  const js2 = codegen2.codegen(type);
  const js3 = codegen3.codegen(type);

  const fn1 = eval(js1);
  const fn2 = eval(js2);
  const fn3 = eval(js3);

  const result1 = fn1(json);
  const result2 = fn2(json);
  const result3 = fn3(json);

  console.log(fn1.toString());
  // console.log(fn2.toString());
  // console.log(fn3.toString());

  expect(result1).toBe(expected);
  expect(result2).toBe(!!expected);
  expect(result3).toBe(!!expected);
};

test('serializes according to schema a POJO object', () => {
  const type = t.Object({
    unknownFields: false,
    fields: [
      t.Field('collection', t.Object({
        unknownFields: false,
        fields: [
          t.Field('id', t.str),
          t.Field('ts', t.num),
          t.Field('cid', t.str),
          t.Field('prid', t.str),
          t.Field('slug', t.str, {isOptional: true}),
          t.Field('name', t.str, {isOptional: true}),
          t.Field('src', t.str, {isOptional: true}),
          t.Field('authz', t.str, {isOptional: true}),
          t.Field('tags', t.Array(t.str)),
        ],
      })),
      t.Field('bin', t.bin),
    ],
  });

  const json = {
    collection: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      ts: Date.now(),
      cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      prid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      slug: 'slug-name',
      name: 'Super collection',
      src: '{"foo": "bar"}',
      authz: 'export const (ctx) => ctx.userId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";',
    },
    bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    // bin: Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    // bin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };

  exec(type, json, '');
});
