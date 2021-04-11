import {LogicalTimestamp} from './clock';

/**
 * Session ID which is reserved by the JSON CRDT Patch protocol for internal
 * usage. This session ID cannot be used by users when editing the documents.
 */
const SYSTEM_SESSION = 0;

/**
 * Represents some sort of root element or is simply the bottom value of a
 * logical timestamp.
 */
export const ORIGIN = new LogicalTimestamp(SYSTEM_SESSION, 0);

/**
 * JSON "null" literal value.
 */
export const NULL_ID = new LogicalTimestamp(SYSTEM_SESSION, 1);

/**
 * JSON "true" literal value.
 */
export const TRUE_ID = new LogicalTimestamp(SYSTEM_SESSION, 2);

/**
 * JSON "false" literal value.
 */
export const FALSE_ID = new LogicalTimestamp(SYSTEM_SESSION, 3);

/**
 * Represents a value that does not exist. Like "undefined" literal value in
 * JavaScript. Can be used instead of a delete operation as a tombstone for
 * object key set operations.
 */
export const UNDEFINED_ID = new LogicalTimestamp(SYSTEM_SESSION, 4);
