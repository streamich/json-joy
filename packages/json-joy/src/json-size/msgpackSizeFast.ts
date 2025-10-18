import {JsonPackExtension, JsonPackValue} from '@jsonjoy.com/json-pack/lib/msgpack';
import {isUint8Array} from '@jsonjoy.com/buffers/lib/isUint8Array';

const arraySize = (arr: unknown[]): number => {
  let size = 2;
  for (let i = arr.length - 1; i >= 0; i--) size += msgpackSizeFast(arr[i]);
  return size;
};

const objectSize = (obj: Record<string, unknown>): number => {
  let size = 2;
  // biome-ignore lint: object hasOwnProperty check is intentional, Object.hasOwn is too recent
  for (const key in obj) if (obj.hasOwnProperty(key)) size += 2 + key.length + msgpackSizeFast(obj[key]);
  return size;
};

/**
 * Same as `jsonSizeFast`, but for MessagePack.
 *
 * - Allows Buffers or Uint8Arrays a MessagePack `bin` values. Adds 5 bytes overhead for them.
 * - Allows embedded `JsonPackValue` values.
 * - Allows MessagePack `JsonPackExtension` extensions. Adds 6 bytes overhead for them.
 *
 * @param value MessagePack value, which can contain binary data, extensions and embedded MessagePack.
 * @returns Approximate size of the value in bytes.
 */
export const msgpackSizeFast = (value: unknown): number => {
  if (value === null) return 1;
  switch (typeof value) {
    case 'number':
      return 9;
    case 'string':
      return 4 + value.length;
    case 'boolean':
      return 1;
  }
  if (Array.isArray(value)) return arraySize(value);
  if (isUint8Array(value)) return 5 + value.length;
  if (value instanceof JsonPackValue) return (value as JsonPackValue).val.length;
  if (value instanceof JsonPackExtension) return 6 + (value as JsonPackExtension).val.length;
  return objectSize(value as Record<string, unknown>);
};
