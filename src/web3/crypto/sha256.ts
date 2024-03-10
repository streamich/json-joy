import {crypto} from './webcrypto';

export const sha256 = async (buf: Uint8Array): Promise<Uint8Array> => {
  const ab = await crypto.subtle.digest('SHA-256', buf);
  return new Uint8Array(ab);
};
