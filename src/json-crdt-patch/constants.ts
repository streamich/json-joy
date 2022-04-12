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

export const enum SYSTEM_SESSION_TIME {
  ORIGIN = 0,
  NULL = 1,
  TRUE = 2,
  FALSE = 3,
  UNDEFINED = 4,
}

/**
 * Represents some sort of root element or is simply the bottom value of a
 * logical timestamp.
 */
export const ORIGIN = new LogicalTimestamp(SESSION.SYSTEM, SYSTEM_SESSION_TIME.ORIGIN);

/**
 * JSON "null" literal value.
 */
export const NULL_ID = new LogicalTimestamp(SESSION.SYSTEM, SYSTEM_SESSION_TIME.NULL);

/**
 * JSON "true" literal value.
 */
export const TRUE_ID = new LogicalTimestamp(SESSION.SYSTEM, SYSTEM_SESSION_TIME.TRUE);

/**
 * JSON "false" literal value.
 */
export const FALSE_ID = new LogicalTimestamp(SESSION.SYSTEM, SYSTEM_SESSION_TIME.FALSE);

/**
 * Represents a value that does not exist. Like "undefined" literal value in
 * JavaScript. Can be used instead of a delete operation as a tombstone for
 * object key set operations.
 */
export const UNDEFINED_ID = new LogicalTimestamp(SESSION.SYSTEM, SYSTEM_SESSION_TIME.UNDEFINED);
