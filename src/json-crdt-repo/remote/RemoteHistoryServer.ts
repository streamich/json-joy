import {Patch} from "../../json-crdt-patch";
import {Log} from "../../json-crdt/log/Log";
import {JsonJoyDemoRpcCaller} from '../../server';
import {CallerToMethods, TypedRpcClient} from '../../reactive-rpc/common';
import type {RemoteHistory} from "./types";
import {Model} from "../../json-crdt/model";

type Methods = CallerToMethods<JsonJoyDemoRpcCaller>;

export type Cursor = number;

export class RemoteHistoryServer implements RemoteHistory<Cursor> {
  constructor (protected readonly client: TypedRpcClient<Methods>) {}

  public async create(id: string, patches: Patch[]): Promise<void> {
    await this.client.call('blocks.create', {
      id,
      patches: patches.map((patch, seq) => ({
        // TODO: seq and created can be skipped in create call.
        seq,
        created: Date.now(),
        blob: patch.toBinary(),
      })),
    });
  }

  /**
   * Load latest state of the model, and any unmerged "tip" of patches
   * it might have.
   *
   * @todo Maybe `state` and `tip` should be serialized to JSON?
   */
  public async read(id: string): Promise<{cursor: Cursor, log: Log}> {
    const {block, patches} = await this.client.call('blocks.get', {id});
    const log = new Log(() => Model.fromBinary(block.blob));
    for (const patch of patches) log.end.applyPatch(Patch.fromBinary(patch.blob));
    // TODO: Preserver block metadata: block.created, block.updated, block.seq.
    // TODO: Preserver patch metadata: patch.created, patch.seq.
    return {
      cursor: block.seq,
      log,
    };
  }

  public async scanAhead(id: string, cursor: Cursor): Promise<{cursor: Cursor, tip: Patch[]}> {
    throw new Error('Method not implemented.');
  }

  public async scanBehind(id: string, cursor: Cursor): Promise<{cursor: Cursor, log: Log}> {
    throw new Error('Method not implemented.');
  }

  public async update(id: string, cursor: Cursor, patches: Patch[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async delete?(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Subscribe to the latest changes to the model.
   * @param callback
   */
  public listen(id: string, cursor: Cursor, callback: (changes: Patch[]) => void): void {
    throw new Error('Method not implemented.');
  }
}
