import {utf8Count} from "../util/utf8";

export const numberSize = (num: number) => JSON.stringify(num).length;

export const stringSize = (str: string) => utf8Count(str) + 2;

export const booleanSize = (bool: boolean) => bool ? 4 : 5;

export const arraySize = (arr: unknown[]) => {
  let size = 0;
  const length = arr.length;
  for (let i = 0; i < length; i++) size += jsonSize(arr[i]);
  return size + 2 + (length > 2 ? length - 1 : 0);
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
