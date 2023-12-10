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
    {
      ""%),047;>BEILPTW": [
        "]\`dgknrvy}",
        "aehlpswz #",
        "knruy|"&)-04",
        "vy}#&*-148;?CF",
        378700000.0000067,
        399200000.0000046,
        483700000.0000056,
        568200000.0000067,
        422500000.00000507,
        466300000.0000035,
        588700000.0000046,
        "imptw{ $'+/2",
        [
          "bfimqtx{!$(",
          "jnquy|"%),03",
          "hlosvz}#'*.1",
          "jnqux|!%),03",
          "lpswz $'+.25",
          "adhkosvz}#",
          {},
        ],
      ],
      "58<": false,
      "6:=": false,
      "8;?": false,
      "AEHLO": 244800000.0000021,
      "DHLOSV": 279600000.0000062,
      "FJNQUX": -3601078262045373,
      "GKNRUY": -3494793310839458,
      "ORVY]\`d": 387700000.000001,
      "PTW[_bfi": 405100000.00000304,
      "UY\\\`cgjn": 454799999.99999994,
      "i": "\\_cfjmqtx|",
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

test('emoji strings can be converted to UTF-8', () => {
  for (let i = 0; i < 100; i++) {
    const str = '👍🏻😛' + '👍🏻😛';
    const test = Buffer.from(str).toString('utf8');
    expect(test).toBe(str);
  }
});

test('random strings can be converted to UTF-8', () => {
  for (let i = 0; i < 1000; i++) {
    const str = RandomJson.genString(10);
    const test = Buffer.from(str).toString('utf8');
    expect(test).toBe(str);
  }
});
