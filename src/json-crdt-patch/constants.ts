import {LogicalTimestamp} from './clock';

export const enum SESSION {
  /**
   * Session ID which is reserved by the JSON CRDT Patch protocol for internal
   * usage. This session ID cannot be used by users when editing the documents.
   */
  SYSTEM = 0,

  /**
   * The only valid session ID for CRDT ran in the server clock mode.
   */
  SERVER = 1,
}

/**
 * Represents some sort of root element or is simply the bottom value of a
 * logical timestamp.
 */
export const ORIGIN = new LogicalTimestamp(SESSION.SYSTEM, 0);

/**
 * JSON "null" literal value.
 */
export const NULL_ID = new LogicalTimestamp(SESSION.SYSTEM, 1);

/**
 * JSON "true" literal value.
 */
export const TRUE_ID = new LogicalTimestamp(SESSION.SYSTEM, 2);

/**
 * JSON "false" literal value.
 */
export const FALSE_ID = new LogicalTimestamp(SESSION.SYSTEM, 3);

/**
 * Represents a value that does not exist. Like "undefined" literal value in
 * JavaScript. Can be used instead of a delete operation as a tombstone for
 * object key set operations.
 */
export const UNDEFINED_ID = new LogicalTimestamp(SESSION.SYSTEM, 4);
