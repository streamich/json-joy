import {RandomJson} from '../RandomJson';

test('generates random JSON', () => {
  const mathRandom = Math.random;
  let i = 0.0;
  Math.random = () => {
    i += 0.0379;
    if (i >= 1) i -= 1;
    return i;
  };
  const rj = new RandomJson();
  const json = rj.create();
  const str = JSON.stringify(json);
  expect(str.length > 5).toBe(true);
  expect(JSON.parse(str)).toEqual(json);
  expect(json).toMatchInlineSnapshot(`
    Object {
      "15": null,
      "6:=": false,
      "8;?": false,
      ":=AD": false,
      "=@DG": false,
      "CFJMQ": 259400000.00000158,
      "NQUY\\\\\`c": 378999999.99999994,
      "PTW[^bei": "uy|\\"%),047;>BE",
      "SWZ^aehl": 434300000.000002,
      "TW[_bfim": 443000000.00000304,
      "Y]\`dhkorv": "{ $'+/269=@DHKO",
      "ᮘ": Object {
        " #'*.259<@CGKNR": Array [
          Array [
            "ilptw{ $'+/2",
            Object {
              "EILPTW": "nquy|\\"%),037;",
              "QTX[_cfj": "vy}\\"&*-148;?CF",
              "Z^aehlosw": "|!%(,/36:>AEHLO",
              "ፓᴇ⚻は㨢䏖䶊圾惲檥瑙縍蟁酴鬨ꓜ": Object {},
            },
            "ux|!%),037:>AE",
            null,
          ],
        ],
        "37:": "cfjmqtx|!%(",
        "47;": "cgknruy|\\"&)",
        "NQUX\\\\_c": 375900000.0000041,
        "ORVY]\`d": 387400000.0000077,
        "VZ]aehlos": 469100000.00000614,
        "X[_bfimqt": 483700000.0000056,
        "]adhkosvz}": 542100000.0000036,
        "\`dgknrvy}\\"": 574100000.0000051,
        "beilpswz $'": 588700000.0000046,
      },
    }
  `);
  Math.random = mathRandom;
});

test('can enforce root node to be object', () => {
  const rj = new RandomJson({rootNode: 'object'});
  const json = rj.create();
  expect(!!json).toBe(true);
  expect(typeof json).toBe('object');
  expect(Array.isArray(json)).toBe(false);
});

test('can enforce root node to be array', () => {
  const json = RandomJson.generate({rootNode: 'array'});
  expect(Array.isArray(json)).toBe(true);
});

describe('exact root type', () => {
  describe('.genString()', () => {
    test('can generate a string', () => {
      const json = RandomJson.genString();
      expect(typeof json).toBe('string');
    });
  });

  describe('.genNumber()', () => {
    test('can generate a number', () => {
      const json = RandomJson.genNumber();
      expect(typeof json).toBe('number');
    });
  });

  describe('.genBoolean()', () => {
    test('can generate a boolean', () => {
      const json = RandomJson.genBoolean();
      expect(typeof json).toBe('boolean');
    });
  });

  describe('.genArray()', () => {
    test('can generate a array', () => {
      const json = RandomJson.genArray();
      expect(json instanceof Array).toBe(true);
    });
  });

  describe('.genObject()', () => {
    test('can generate a object', () => {
      const json = RandomJson.genObject();
      expect(typeof json).toBe('object');
      expect(!!json).toBe(true);
    });
  });
});
