import {UwsHttpResponse} from './types';

const MAX_BODY_SIZE = 1024 * 1024;

export const readBody = (res: UwsHttpResponse, cb: (buf: Buffer) => void) => {
  let buffer: undefined | Buffer;
  res.onData((ab, isLast) => {
    const chunk = Buffer.from(ab);
    buffer = Buffer.concat(buffer ? [buffer, chunk] : [chunk]);
    if (buffer.length > MAX_BODY_SIZE) res.end('too large');
    if (isLast) cb(buffer);
  });
};
