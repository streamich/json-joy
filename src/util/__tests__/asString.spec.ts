import {asString} from '../asString';

const check = (str: string) => {
  expect(asString(str)).toBe(JSON.stringify(str));
  expect(JSON.parse(asString(str))).toBe(str);
};

test('encodes the same as JSON.stringfy()', () => {
  check('');
  check('"');
  check('\'');
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
