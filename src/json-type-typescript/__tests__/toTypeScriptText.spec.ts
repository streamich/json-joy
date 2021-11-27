import {t} from '../../json-type';
import {toTypeScriptText} from '../toTypeScriptText';

test('outputs expected TypeScript source', () => {
  const type = t.Object([
    t.Field('id', t.str, {
      title: 'ID',
      description: 'ID of the object.'
    }),
    t.Field('ts', t.num),
    t.Field('active', t.bool),
    t.Field('nil', t.nil),
    t.Field('address', t.Object([
      t.Field('street', t.str, {description: 'Street address.'}),
    ])),
  ]);
  const source = toTypeScriptText(type, '');

  expect(source).toBe(`{
  /**
   * # ID
   *
   * ID of the object.
   */
  id: string;

  ts: number;

  active: boolean;

  nil: null;

  address: {
    /**
     * Street address.
     */
    street: string;
  };
}`);
});
