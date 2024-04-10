import {Log} from '../../json-crdt/log/Log';
import type {Patch} from '../../json-crdt-patch';

/**
 * A history of patches that have been applied to a model, stored on the
 * "remote": (1) server; (2) content addressable storage; or (3) somewhere in a
 * peer-to-peer network.
 */
export interface RemoteHistory<Cursor> {
  create(id: string, patches: Patch[]): Promise<void>;

  /**
   * Load latest state of the model, and any unmerged "tip" of patches
   * it might have.
   *
   * @todo Maybe `state` and `tip` should be serialized to JSON?
   */
  read(id: string): Promise<{cursor: string, log: Log}>;

  scanAhead(id: string, cursor: Cursor): Promise<{cursor: Cursor, tip: Patch[]}>;

  scanBehind(id: string, cursor: Cursor): Promise<{cursor: Cursor, log: Log}>;

  update(id: string, cursor: Cursor, patches: Patch[]): Promise<void>;

  delete?(id: string): Promise<void>;

  /**
   * Subscribe to the latest changes to the model.
   * @param callback
   */
  listen(id: string, cursor: Cursor, callback: (changes: Patch[]) => void): void;
}
