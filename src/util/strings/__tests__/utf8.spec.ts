import {utf8Size} from '../utf8';

describe('utf8Size', () => {
  describe('computes correct size', () => {
    const check = (str: string) => {
      expect(utf8Size(str)).toBe(Buffer.from(str).byteLength);
    };

    test('encodes the same as JSON.stringify()', () => {
      check('');
      check('"');
      check("'");
      check('asdf');
      check('asdfasdfasdfasdfsadfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfsadfasdfasdfasdf');
      check('🍻');
      check('👩‍👩‍👦‍👦');
      check('Лексилогос');
      check('\b');
      check('\b\t\0');
      check('\0');
      check('\f');
      check('\r');
      check('\n');
    });
  });
});
