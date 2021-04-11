const isBrowser = typeof Blob !== 'undefined';
export const byteLength = isBrowser ? (str: string): number => new Blob([str]).size : Buffer.byteLength;
