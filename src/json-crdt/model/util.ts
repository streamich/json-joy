import {SESSION} from '../../json-crdt-patch/constants';

const RESERVED = 0xffff;
const DIFF = SESSION.MAX - RESERVED;

/**
 * Generates a random session ID up to 53 bits in size, skips first 0xFFFF
 * values, keeping them reserved for future extensions.
 *
 * @returns Random session ID.
 */
export const randomSessionId = () => Math.floor(DIFF * Math.random() + RESERVED);
