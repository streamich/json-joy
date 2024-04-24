import {TypeSystem} from '../../json-type/system';
import {ObjectValue} from '../ObjectValue';

test('can retrieve field as Value', () => {
  const system = new TypeSystem();
  const {t} = system;
  const obj = new ObjectValue(t.Object(t.prop('foo', t.str)), {foo: 'bar'});
  const foo = obj.get('foo');
  expect(foo.type.getTypeName()).toBe('str');
  expect(foo.data).toBe('bar');
});

test('can print to string', () => {
  const system = new TypeSystem();
  const {t} = system;
  const obj = new ObjectValue(t.Object(t.prop('foo', t.str)), {foo: 'bar'});
  expect(obj + '').toMatchSnapshot();
});
