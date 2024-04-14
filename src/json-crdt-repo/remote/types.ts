/**
 * A history of patches that have been applied to a model, stored on the
 * "remote": (1) server; (2) content addressable storage; or (3) somewhere in a
 * peer-to-peer network.
 */
export interface RemoteHistory<Cursor, M extends RemoteModel = RemoteModel, P extends RemotePatch = RemotePatch> {
  create(id: string, patches: RemotePatch[]): Promise<void>;

  /**
   * Load latest state of the model, and any unmerged "tip" of patches
   * it might have.
   *
   * @todo Maybe `state` and `tip` should be serialized to JSON?
   */
  read(id: string): Promise<{cursor: Cursor; model: M; patches: P[]}>;

  scanFwd(id: string, cursor: Cursor): Promise<{cursor: Cursor; patches: P[]}>;

  scanBwd(id: string, cursor: Cursor): Promise<{cursor: Cursor; model: M; patches: P[]}>;

  update(id: string, cursor: Cursor, patches: RemotePatch[]): Promise<{cursor: Cursor; patches: P[]}>;

  delete?(id: string): Promise<void>;

  /**
   * Subscribe to the latest changes to the model.
   * @param callback
   */
  listen(id: string, cursor: Cursor, callback: (patches: P[]) => void): void;
}

export interface RemoteModel {
  blob: Uint8Array;
}

export interface RemotePatch {
  blob: Uint8Array;
}
