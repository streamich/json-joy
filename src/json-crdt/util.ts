// export const randomStr = (length: number, alphabet: string): string => {
//   let str = '';
//   const alphabetLength = alphabet.length;
//   for (let i = 0; i < length; i++) {
//     str += alphabet.charAt(Math.floor(Math.random() * alphabetLength));
//   }
//   return str;
// };

// const idAlphabet = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
// export const generateId = (len: number = 10) => randomStr(len, idAlphabet);

// const clockAlphabet = "0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
// const clockAlphabetLen = clockAlphabet.length;
// export const clockToString = (clock: number) => {
//   let str = '';
//   do {
//     const mod = clock % clockAlphabetLen;
//     str = clockAlphabet[mod] + str;
//     clock = (clock - mod) / clockAlphabetLen;
//   } while (clock);
//   return str;
// };

/**
 * Generate a random 53-bit integer, 53-bit because that is the maximum safe integer
 * for IEEE 754 floating point numbers, which JavaScript uses. This random integer
 * is used as session ID for tagging JSON CRDT Patch patches.
 */
// export const random53BitInt = () => Math.floor(9007199254740991 * (Math.random()));

/**
 * Generate a random 48-bit integer, 48-bit because when session ID is 48-bit and
 * logical clock is encoded in 16 bits, they both together can be encoded as 64-bit
 * integer. This random integer is used as session ID for tagging JSON CRDT Patch
 * patches.
 */
// export const random48BitInt = () => Math.floor(281474976710656 /* 2**48 */ * Math.random());

/**
 * Generate a random 40-bit integer. We use 40-bit integer (5 bytes) for session ID, because
 * the logical clock counter is represented by 24-bit integer, and together they
 * combine into 64-bit integer (8 bytes).
 */
export const random40BitInt = () => Math.floor(0xFF_FF_FF_FF_FF * Math.random());
