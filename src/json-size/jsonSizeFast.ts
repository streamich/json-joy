const arraySize = (arr: unknown[]): number => {
  let size = 2;
  for (let i = arr.length - 1; i >= 0; i--) size += jsonSizeFast(arr[i]);
  return size;
};

const objectSize = (obj: Record<string, unknown>): number => {
  let size = 2;
  for (const key in obj) if (obj.hasOwnProperty(key)) size += 2 + key.length + jsonSizeFast(obj[key]);
  return size;
};

/**
 * This function is the fastest way to approximate size of JSON object in bytes.
 *
 * It uses the following heuristics:
 *
 * - Boolean: 1 byte.
 * - Null: 1 byte.
 * - Number: 9 bytes (1 byte to store the number type, 8 bytes to store the number).
 * - String: 4 bytes + string length. String length is encoded in UTF-8, so it is not
 *   exactly the same as the number of bytes in the string.
 * - Array: 2 bytes + sum of sizes of elements.
 * - Object: 2 bytes + 2 bytes for each key + length of each key + sum of sizes of values.
 *
 * Rationale:
 *
 * - Booleans and `null` are stored as one byte in MessagePack.
 * - Maximum size of a number in MessagePack is 9 bytes (1 byte for the type,
 *   8 bytes for the number).
 * - Maximum overhead for string storage is 4 bytes in MessagePack. We use that, especially
 *   because we approximate the size of strings in UTF-8, which can consume more bytes if
 *   non-ASCII characters are present.
 * - Maximum overhead for arrays is 4 bytes in MessagePack, but we use 2 bytes for the
 *   array length, as we don't expect most arrays to be longer than 65,535 elements.
 * - Maximum overhead for objects is 4 bytes in MessagePack, but we use 2 bytes for the
 *   object length, as we don't expect most objects to have more than 65,535 keys.
 * - For object keys we use 2 bytes overhead for each key, as we don't expect most
 *   keys to be longer than 65,535 characters.
 *
 * @param value JSON value to calculate approximate size of
 * @returns Number of bytes required to store the JSON value
 */
export const jsonSizeFast = (value: unknown): number => {
  if (value === null) return 1;
  switch (typeof value) {
    case 'number':
      return 9;
    case 'string':
      return 4 + value.length;
    case 'boolean':
      return 1;
  }
  if (value instanceof Array) return arraySize(value);
  return objectSize(value as Record<string, unknown>);
};
