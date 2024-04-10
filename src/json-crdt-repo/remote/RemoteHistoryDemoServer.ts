import type {CallerToMethods, TypedRpcClient} from '../../reactive-rpc/common';
import type {JsonJoyDemoRpcCaller} from '../../server';
import type {RemoteHistory, RemoteModel, RemotePatch} from "./types";

type Methods = CallerToMethods<JsonJoyDemoRpcCaller>;

export type Cursor = number;

export interface RemoteServerModel extends RemoteModel {
  seq: number;
  created: number;
  updated: number;
}

export interface RemoteServerPatch extends RemotePatch {
  seq: number;
}

export class RemoteHistoryDemoServer implements RemoteHistory<Cursor, RemoteServerModel, RemoteServerPatch> {
  constructor (protected readonly client: TypedRpcClient<Methods>) {}

  public async create(id: string, patches: RemotePatch[]): Promise<void> {
    await this.client.call('block.new', {
      id,
      patches: patches.map((patch, seq) => ({
        // TODO: seq and created should be set on server. (And returned back?)
        seq,
        created: Date.now(),
        blob: patch.blob,
      })),
    });
  }

  /**
   * Load latest state of the model, and any unmerged "tip" of patches
   * it might have.
   */
  public async read(id: string): Promise<{cursor: Cursor, model: RemoteServerModel, patches: RemoteServerPatch[]}> {
    const {block, patches} = await this.client.call('block.get', {id});
    return {
      cursor: block.seq,
      model: block,
      patches,
    };
  }

  public async scanFwd(id: string, cursor: Cursor): Promise<{cursor: Cursor, patches: RemoteServerPatch[]}> {
    const limit = 100;
    const res = await this.client.call('block.scan', {
      id,
      min: cursor,
      max: cursor + limit,
    });
    if (res.patches.length === 0) {
      return {
        cursor,
        patches: [],
      };
    }
    return {
      cursor: res.patches[res.patches.length - 1].seq,
      patches: res.patches,
    };
  }

  public async scanBwd(id: string, cursor: Cursor): Promise<{cursor: Cursor, model: RemoteServerModel, patches: RemoteServerPatch[]}> {
    throw new Error('The "blocks.history" should be able to return starting model.');
  }

  public async update(id: string, cursor: Cursor, patches: RemotePatch[]): Promise<{cursor: Cursor, patches: RemoteServerPatch[]}> {

    const res = await this.client.call('block.upd', {
      id,
      patches: patches.map((patch, seq) => ({
        seq,
        created: Date.now(),
        blob: patch.blob,
      })),
    });
    return {
      cursor: res.patches.length ? res.patches[res.patches.length - 1].seq : cursor,
      patches: res.patches,
    };
  }

  public async delete?(id: string): Promise<void> {
    await this.client.call('block.del', {id});
  }

  /**
   * Subscribe to the latest changes to the model.
   * @param callback
   */
  public listen(id: string, cursor: Cursor, callback: (changes: RemoteServerPatch[]) => void): void {
    throw new Error('Method not implemented.');
  }
}
