import {t} from '../../json-type';
import {JsonSerializerCodegen} from '../json';
import {TType} from '../../json-type/types';
import {asString} from '../../util/asString';

const exec = (type: TType, json: unknown) => {
  const codegen = new JsonSerializerCodegen();
  codegen.createPlan(type);
  const js = codegen.codegen();
  const fn = eval(js)(asString);
  // console.log(fn.toString());
  const serialized = fn(json);
  console.log('serialized', serialized);
  const decoded = JSON.parse(serialized);
  expect(decoded).toStrictEqual(json);
};

test('serializes according to schema a POJO object', () => {
  const type = t.str;
  const json = "asdf";

  exec(type, json);
});
