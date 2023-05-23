import {t} from '..';

test('generates random JSON', () => {
  const mathRandom = Math.random;
  let i = 0.0;
  Math.random = () => {
    i += 0.0379;
    if (i >= 1) i -= 1;
    return i;
  };
  const type = t.Object(
    t.prop('id', t.str),
    t.prop('name', t.str),
    t.prop('tags', t.Array(t.str)),
    t.propOpt('scores', t.Array(t.num)),
  );
  const json = type.random();
  expect(json).toMatchInlineSnapshot(`
    {
      "id": "",
      "name": "1",
      "tags": [
        "@CG",
        "QUY\\\`",
      ],
    }
  `);
  Math.random = mathRandom;
});
