import {stringify} from '..';
import {binUriStart} from '../constants';

test('can stringify an empty buffer', () => {
  const json = stringify(new Uint8Array(0));
  expect(json).toBe(`"${binUriStart}"`);
});

test('can stringify a short buffer', () => {
  const json = stringify(new Uint8Array([0, 1, 2, 3]));
  expect(json).toBe(`"${binUriStart}AAECAw=="`);
});

test('can stringify a short buffer in an object', () => {
  const json = stringify({
    foo: new Uint8Array([0, 1, 2, 3]),
  });
  expect(json).toBe(`{"foo":"${binUriStart}AAECAw=="}`);
});

test('can stringify a short buffer in an array', () => {
  const json = stringify([null, 1, new Uint8Array([0, 1, 2, 3]), 'a']);
  expect(json).toBe(`[null,1,"${binUriStart}AAECAw==","a"]`);
});
