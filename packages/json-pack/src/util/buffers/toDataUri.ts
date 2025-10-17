import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';

export const toDataUri = (buf: Uint8Array, params?: Record<string, string | number>): string => {
  let uri = 'data:application/octet-stream;base64';
  for (const key in params) uri += `;${key}=${params[key]}`;
  return uri + ',' + toBase64(buf);
};
