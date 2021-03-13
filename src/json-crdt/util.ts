export const randomStr = (length: number, alphabet: string): string => {
  let str = '';
  const alphabetLength = alphabet.length;
  for (let i = 0; i < length; i++) {
    str += alphabet.charAt(Math.floor(Math.random() * alphabetLength));
  }
  return str;
};

const idAlphabet = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
export const generateId = (len: number = 10) => randomStr(len, idAlphabet);

const clockAlphabet = "0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const clockAlphabetLen = clockAlphabet.length;
export const clockToString = (clock: number) => {
  let str = '';
  do {
    const mod = clock % clockAlphabetLen;
    str = clockAlphabet[mod] + str;
    clock = (clock - mod) / clockAlphabetLen;
  } while (clock);
  return str;
};
