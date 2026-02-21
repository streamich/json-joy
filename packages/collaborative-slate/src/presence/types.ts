import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

/** Remote user information for display on carets and selection highlights. */
export interface PresenceUser {
  name?: string;
  color?: string;
}

export interface SlatePresenceOpts<Meta extends object = object> {
  /** The shared presence store. */
  manager: PresenceManager<Meta>;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. When omitted, user info is not available on carets. */
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;
  /** Milliseconds after which the name label fades (default 3000). */
  fadeAfterMs?: number;
  /** Milliseconds of inactivity after which the caret dims (default 30000). */
  dimAfterMs?: number;
  /** Milliseconds of inactivity after which the presence is hidden (default 60000). */
  hideAfterMs?: number;
  /** Interval in ms for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000. */
  gcIntervalMs?: number;
}

/**
 * Custom properties added to Slate `Range` objects returned by the presence
 * `decorate` function. These are received by the `renderLeaf` component.
 */
export interface PresenceDecoration {
  /** Semi-transparent background color for selection highlights. */
  presenceHighlight?: string;
  /** When set, a caret should be rendered at the start of this leaf. Contains
   * the peer ID whose caret this represents. */
  presenceCaret?: PresenceCaretInfo;
}

export interface PresenceCaretInfo {
  peerId: string;
  color: string;
  name: string;
  fadeAfterMs: number;
  dimAfterMs: number;
  hideAfterMs: number;
  receivedAt: number;
}
