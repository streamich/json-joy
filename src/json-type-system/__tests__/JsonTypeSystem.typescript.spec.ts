import {JsonTypeSystem} from '../JsonTypeSystem';
import {types, customValidators} from '../../demo/json-type/samples';
import {toText} from '../../json-type-typescript/toText';

test('generates JSON schema for simple string type', () => {
  const system = new JsonTypeSystem({types, customValidators});
  const declarations = system.toTsAst();
  const text = toText(declarations);
  expect(declarations).toMatchSnapshot();
  expect(text).toMatchSnapshot();
});
