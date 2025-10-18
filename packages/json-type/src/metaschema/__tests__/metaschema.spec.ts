import {ModuleType} from '../../type';
import {module} from '../metaschema';

test('can import metaschema', () => {
  const mod = ModuleType.from(module);
  // console.log(mod + '');
  expect(mod + '').toMatchSnapshot();
});
