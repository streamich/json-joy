import {gzip, ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {toBase64Url} from '@jsonjoy.com/base64/lib/toBase64Url';
import {fromBase64Url} from '@jsonjoy.com/base64/lib/fromBase64Url';

const SALT_LEN = 16;
const IV_LEN = 12;
const PBKDF2_ITERATIONS = 200_000;

const subtle = (): SubtleCrypto => {
  const c = (globalThis as any).crypto;
  if (!c?.subtle) throw new Error('NO_CRYPTO');
  return c.subtle;
};

const randomBytes = (length: number): Uint8Array => {
  const c = (globalThis as any).crypto;
  if (!c?.getRandomValues) throw new Error('NO_CRYPTO');
  return c.getRandomValues(new Uint8Array(length));
};

const deriveKey = async (password: string, salt: Uint8Array, usage: KeyUsage[]): Promise<CryptoKey> => {
  const baseKey = await subtle().importKey(
    'raw',
    new TextEncoder().encode(password),
    {name: 'PBKDF2'},
    false,
    ['deriveKey'],
  );
  return subtle().deriveKey(
    {name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256'},
    baseKey,
    {name: 'AES-GCM', length: 256},
    false,
    usage,
  );
};

/**
 * Encode the document binary as a base64url string suitable for embedding in
 * a URL. The bytes are gzip-compressed before encoding.
 */
export const encodeShareBlob = async (bytes: Uint8Array): Promise<string> => {
  const compressed = await gzip(bytes);
  return toBase64Url(compressed, compressed.length);
};

/**
 * Encode the document binary as an encrypted, base64url-encoded string.
 */
export const encodeEncryptedShareBlob = async (bytes: Uint8Array, password: string): Promise<string> => {
  if (!password) throw new Error('NO_PWD');
  const compressed = await gzip(bytes);
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = await deriveKey(password, salt, ['encrypt']);
  const ct = new Uint8Array(
    await subtle().encrypt({name: 'AES-GCM', iv: iv as BufferSource}, key, compressed as BufferSource),
  );
  const out = new Uint8Array(SALT_LEN + IV_LEN + ct.length);
  out.set(salt, 0);
  out.set(iv, SALT_LEN);
  out.set(ct, SALT_LEN + IV_LEN);
  return toBase64Url(out, out.length);
};

/**
 * Decode a plaintext share blob produced by {@link encodeShareBlob}.
 */
export const decodeShareBlob = async (encoded: string): Promise<Uint8Array> => {
  const compressed = fromBase64Url(encoded);
  return (await ungzip(compressed)) as Uint8Array;
};

/**
 * Decode an encrypted share blob produced by {@link encodeEncryptedShareBlob}.
 */
export const decodeEncryptedShareBlob = async (encoded: string, password: string): Promise<Uint8Array> => {
  const blob = fromBase64Url(encoded);
  if (blob.length < SALT_LEN + IV_LEN + 16) throw new Error('Encrypted blob is too short to be valid.');
  const salt = blob.slice(0, SALT_LEN);
  const iv = blob.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ct = blob.slice(SALT_LEN + IV_LEN);
  const key = await deriveKey(password, salt, ['decrypt']);
  const compressed = new Uint8Array(
    await subtle().decrypt({name: 'AES-GCM', iv: iv as BufferSource}, key, ct as BufferSource),
  );
  return (await ungzip(compressed)) as Uint8Array;
};
