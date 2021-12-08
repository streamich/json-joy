import {t} from '../../json-type';
import {randomType} from '../randomType';

test('generates random JSON', () => {
  const mathRandom = Math.random;
  let i = 0.0;
  Math.random = () => {
    i += 0.0379;
    if (i >= 1) i -= 1;
    return i;
  };
  const type = t.Object([
    t.Field('id', t.str),
    t.Field('name', t.str),
    t.Field('tags', t.Array(t.str)),
    t.Field('scores', t.Array(t.num), {isOptional: true}),
  ]);
  const json = randomType(type, {});
  expect(json).toStrictEqual({id: 'ᴛ', name: '58<', tags: ['JNQUY\\`', 'jnquy|"%),04', '>BEIL']});
  Math.random = mathRandom;
});
