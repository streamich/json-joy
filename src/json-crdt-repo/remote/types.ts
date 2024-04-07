import type {Patch} from '../../json-crdt-patch';
import type {Model} from '../../json-crdt/model';

/**
 * A history of patches that have been applied to a model, stored on the
 * "remote": (1) server; (2) content addressable storage; or (3) somewhere in a
 * peer-to-peer network.
 *
 * Cases:
 *
 * - `RemoteHistoryServer`
 * - `RemoteHistoryServerIdempotent`
 * - `RemoteHistoryCAS`
 * - `RemoteHistoryP2P`
 */
export interface RemoteHistory<Cursor> {
  create(id: string, patches: Patch[], start?: Model): Promise<void>;

  /**
   * Load latest state of the model, and any unmerged "tip" of patches
   * it might have.
   *
   * @todo Maybe `state` and `tip` should be serialized to JSON?
   */
  loadLatest(id: string): Promise<[cursor: Cursor, state: Model]>;

  loadAfter(id: string, cursor: Cursor): Promise<[cursor: Cursor, tip: Patch[]]>;

  loadBefore(id: string, cursor: Cursor): Promise<[cursor: Cursor, state: Model, tip: Patch[]]>;

  apply(id: string, patches: Patch[]): Promise<void>;

  /**
   * Subscribe to the latest changes to the model.
   * @param callback
   */
  subscribe(id: string, cursor: Cursor, callback: (changes: Patch[]) => void): void;
}
