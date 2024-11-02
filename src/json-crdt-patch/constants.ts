import {ts} from './clock';
import {SESSION, SYSTEM_SESSION_TIME} from './enums';

export * from './enums';

/**
 * Represents some sort of root element or is simply the bottom value of a
 * logical timestamp.
 */
export const ORIGIN = ts(SESSION.SYSTEM, SYSTEM_SESSION_TIME.ORIGIN);
