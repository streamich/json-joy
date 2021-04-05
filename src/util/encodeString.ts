const textEncoder: TextEncoder | null = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
export const encodeString = textEncoder
  ? (str: string): ArrayBuffer => textEncoder.encode(str)
  : (str: string): ArrayBuffer => Buffer.from(str);
