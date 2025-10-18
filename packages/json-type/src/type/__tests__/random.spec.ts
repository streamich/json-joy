import {t} from '..';
import {Random} from '../../random';

test('generates random JSON', () => {
  const mathRandom = Math.random;
  let i = 0.0;
  Math.random = () => {
    i += 0.0379;
    if (i >= 1) i -= 1;
    return i;
  };
  const type = t.Object(
    t.Key('id', t.str),
    t.Key('name', t.str),
    t.Key('tags', t.Array(t.str)),
    t.KeyOpt('scores', t.Array(t.num)),
    t.Key('refs', t.Map(t.str)),
  );
  const json = Random.gen(type);
  expect(typeof json).toBe('object');
  expect(!!json).toBe(true);
  expect(typeof json.id).toBe('string');
  expect(typeof json.name).toBe('string');
  expect(Array.isArray(json.tags)).toBe(true);
  expect(typeof json.refs).toBe('object');
  Math.random = mathRandom;
});
