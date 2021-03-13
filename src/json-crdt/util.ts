export const idAlphabet = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

export const randomStr = (length: number, alphabet: string): string => {
  let str = '';
  const alphabetLength = alphabet.length;
  for (let i = 0; i < length; i++) {
    str += alphabet.charAt(Math.floor(Math.random() * alphabetLength));
  }
  return str;
};

export const generateId = (len: number = 10) => randomStr(len, idAlphabet);
