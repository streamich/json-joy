import {Encoder} from '../v1';
import {decode} from '../../decode';

test('resizes buffer to accommodate size', () => {
  const json = {
    foo: 'adsfasdflakjsdflaksjdflasdkjfasldfkjasdf',
    bar: 123.123123123,
    lol: 'adsfkljalsdf laksdjfasdfasdf',
    aga: ['laksdjflakj alskdfj alsdkjf lasjdf laskjdf laskdfj asdf asdf'],
  };
  const encoder = new Encoder(100);
  const buf = encoder.encode(json);
  expect(decode(buf, 0)[0]).toEqual(json);
});