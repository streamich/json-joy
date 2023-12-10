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
    t.prop('refs', t.Map(t.str)),
  );
  const json = type.random();
  expect(json).toMatchInlineSnapshot(`
    {
      "id": "",
      "name": "1",
      "refs": {
        "259<@CGK": "UY\\\`c",
        ";>BEILPT": "^beimp",
        "HKORVY]\`": "korvy}#",
        "LOSWZ^ae": "pswz #'*",
        "_cfjmqtx": "fimqtxBEIM",
        "knrvyCGJ": "MQTX",
        "nquy|"%)": "4",
        "w{ $'+/2": "=@",
      },
      "tags": [
        "@CG",
        "QUY\\\`",
      ],
    }
  `);
  Math.random = mathRandom;
});
