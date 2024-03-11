import {isNode} from '../constants';

/**
 * Universal Node.js/browser Web Crypto API reference.
 *
 * @todo Maybe create an isomorphic package for this?
 */
export const crypto: Crypto = isNode ? require('node:crypto').webcrypto : window.crypto;
