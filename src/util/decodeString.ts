const textDecoder: TextDecoder | null = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
export const decodeString = textDecoder
  ? (buf: ArrayBuffer, offset: number, length: number): string => textDecoder.decode(buf.slice(offset, offset + length))
  : (buf: ArrayBuffer, offset: number, length: number): string =>
      Buffer.from(buf)
        .slice(offset, offset + length)
        .toString();
