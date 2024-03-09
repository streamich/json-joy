/**
 * @todo The `multibase` is old, and does not have the best performance.
 * Especially because it concatenates Uint8Arrays and returns back another
 * Uint8Array. But the output of this text encoding is a string, it could
 * encode to string directly. Same as what json-joy Base64 does.
 */
import {encode, decode, BaseNameOrCode} from 'multibase';

export {encode, decode, BaseNameOrCode};
