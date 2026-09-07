import {decodeUtf8} from './utf8/decodeUtf8';

export const toStr = (buf: Uint8Array): string => decodeUtf8(buf, 0, buf.length);
