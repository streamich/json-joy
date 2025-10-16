import {encodeUtf8Write, encodeFrom, encodeNative, encodeTe, encode, EncodeString} from '../encode';

const ascii = (): string => {
  return String.fromCharCode(Math.floor(32 + Math.random() * (126 - 32)));
};

const alphabet = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '-',
  '_',
  '.',
  ',',
  ';',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '\\',
  '/',
  '(',
  ')',
  '+',
  '=',
  '\n',
  '👍',
  '🏻',
  '😛',
  'ä',
  'ö',
  'ü',
  'ß',
  'а',
  'б',
  'в',
  'г',
  '诶',
  '必',
  '西',
];
const utf16 = (): string => {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
};

class RandomJson {
  public static genString(length = Math.ceil(Math.random() * 16)): string {
    let str: string = '';
    if (Math.random() < 0.1) for (let i = 0; i < length; i++) str += utf16();
    else for (let i = 0; i < length; i++) str += ascii();
    if (str.length !== length) return ascii().repeat(length);
    return str;
  }
}

describe('can encode JavaScript string as UTF-8 string', () => {
  const runEncodingTest = (name: string, encode: EncodeString) => {
    test(name, () => {
      const arr = new Uint8Array(50);
      for (let i = 0; i < 1000; i++) {
        const str = RandomJson.genString(10);
        const len = encode(arr, str, 10, str.length * 4);
        const slice = arr.subarray(10, 10 + len);
        const decoded = Buffer.from(slice).toString();
        expect(decoded).toBe(str);
      }
    });
  };

  runEncodingTest('encodeUtf8Write', encodeUtf8Write);
  runEncodingTest('encodeFrom', encodeFrom);
  runEncodingTest('encodeNative', encodeNative);
  runEncodingTest('encodeTe', encodeTe);
  runEncodingTest('encode', encode);
});
