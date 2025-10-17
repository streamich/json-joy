import {IonEncoderFast} from '../IonEncoderFast';
import {IonDecoder} from '../IonDecoder';

describe('IonDecoder - Simple Values', () => {
  let encoder: IonEncoderFast;
  let decoder: IonDecoder;

  beforeEach(() => {
    encoder = new IonEncoderFast();
    decoder = new IonDecoder();
  });

  const testRoundtrip = (value: unknown, name?: string) => {
    const encoded = encoder.encode(value);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(value);
  };

  test('null', () => {
    testRoundtrip(null);
  });

  test('true', () => {
    testRoundtrip(true);
  });

  test('false', () => {
    testRoundtrip(false);
  });

  test('zero', () => {
    testRoundtrip(0);
  });

  test('small positive integers', () => {
    testRoundtrip(1);
    testRoundtrip(127);
    testRoundtrip(255);
  });

  test('small negative integers', () => {
    testRoundtrip(-1);
    testRoundtrip(-127);
    testRoundtrip(-255);
  });

  test('empty string', () => {
    testRoundtrip('');
  });

  test('short string', () => {
    testRoundtrip('hello');
  });

  test('empty array', () => {
    testRoundtrip([]);
  });

  test('simple array', () => {
    testRoundtrip([1, 2, 3]);
  });

  test('binary data', () => {
    testRoundtrip(new Uint8Array([1, 2, 3]));
  });

  test('empty object', () => {
    testRoundtrip({});
  });

  test('simple object', () => {
    testRoundtrip({a: 1});
  });
});
