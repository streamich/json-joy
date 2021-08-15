import {utf8Count} from "../util/utf8";

export const numberSize = (num: number) => JSON.stringify(num).length;

// export const stringSize2 = (str: string) => {
//   const strLength = str.length;
//   let byteLength = 0;
//   let pos = 0;
//   while (pos < strLength) {
//     let value = str.charCodeAt(pos++);
//     if ((value & 0xffffff80) === 0) {
//       switch (value) {
//         case 8:  // \b
//         case 9:  // \t
//         case 10: // \n
//         case 12: // \f
//         case 13: // \r
//         case 34: // \"
//         case 92: // \\
//           byteLength += 2;
//           break;
//         default:
//           byteLength += 1;
//       }
//       continue;
//     } else if ((value & 0xfffff800) === 0) byteLength += 2;
//     else {
//       if (value >= 0xd800 && value <= 0xdbff) {
//         if (pos < strLength) {
//           const extra = str.charCodeAt(pos);
//           if ((extra & 0xfc00) === 0xdc00) {
//             ++pos;
//             value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
//           }
//         }
//       }
//       if ((value & 0xffff0000) === 0) byteLength += 3;
//       else byteLength += 4;
//     }
//   }
//   return byteLength + 2;
// };

export const stringSize = (str: string) => {
  return utf8Count(JSON.stringify(str));
};

export const booleanSize = (bool: boolean) => bool ? 4 : 5;

export const arraySize = (arr: unknown[]) => {
  let size = 0;
  const length = arr.length;
  for (let i = 0; i < length; i++) size += jsonSize(arr[i]);
  return size + 2 + (length > 1 ? length - 1 : 0);
}

export const objectSize = (obj: Record<string, unknown>) => {
  let size = 2;
  let length = 0;
  for (const key in obj)
    if (obj.hasOwnProperty(key)) {
      length++;
      size += stringSize(key) + jsonSize(obj[key]);
    }
  const colonSize = length;
  const commaSize = length > 1 ? length - 1 : 0;
  return size + colonSize + commaSize;
}

export const jsonSize = (value: unknown) => {
  if (value === null) return 4;
  switch (typeof value) {
    case 'number': return numberSize(value);
    case 'string': return stringSize(value);
    case 'boolean': return booleanSize(value);
  }
  if (value instanceof Array) return arraySize(value);
  return objectSize(value as Record<string, unknown>);
}
