import {t} from '../../json-type';
import {JsonSerializerCodegen} from '../json';
import {TType} from '../../json-type/types';

const exec = (type: TType, json: unknown, expected: unknown = json) => {
  const codegen = new JsonSerializerCodegen({type});
  const fn = codegen.run().compile();
  console.log(fn.toString());
  const serialized = fn(json);
  // console.log('serialized', serialized);
  const decoded = JSON.parse(serialized);
  expect(decoded).toStrictEqual(expected);
};

describe('"str" type', () => {
  test('serializes a plain short string', () => {
    const type = t.str;
    const json = "asdf";
    exec(type, json);
  });

  test('serializes a long string', () => {
    const type = t.str;
    const json = "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
    exec(type, json);
  });

  test('serializes a const string', () => {
    const type = t.String({const: "asdf"});
    const json = "555";
    exec(type, json, 'asdf');
  });
});

describe('"num" type', () => {
  test('serializes numbers', () => {
    const type = t.num;
    exec(type, 0);
    exec(type, 1);
    exec(type, -1);
    exec(type, 4.234);
    exec(type, -23.23);
  });

  test('serializes a const number', () => {
    const type = t.Number({const: 7});
    const json = 123;
    exec(type, json, 7);
  });

  test('serializes integers', () => {
    const type = t.Number({const: 7});
    const json = 123;
    exec(type, json, 7);
  });
});
