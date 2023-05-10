import {ts} from './clock';

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

  /** Max allowed session ID, they are capped at 53-bits. */
  MAX = 9007199254740991,
}

export const enum SYSTEM_SESSION_TIME {
  ORIGIN = 0,
  UNDEFINED = 1,
}

/**
 * Represents some sort of root element or is simply the bottom value of a
 * logical timestamp.
 */
export const ORIGIN = ts(SESSION.SYSTEM, SYSTEM_SESSION_TIME.ORIGIN);
