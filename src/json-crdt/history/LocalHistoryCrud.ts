import {File, FileOptions} from '../file/File';
import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import type {CrudApi} from 'memfs/lib/crud/types';
import type {Locks} from 'thingies/es2020/Locks';
import type {Patch} from '../../json-crdt-patch';
import type {PatchLog} from './PatchLog';
import type {LocalHistory} from './types';

export const genId = (octets: number = 8): string => {
  const uint8 = crypto.getRandomValues(new Uint8Array(octets));
  let hex = '';
  for (let i = 0; i < octets; i++) hex += uint8[i].toString(16).padStart(2, '0');
  return hex;
};

const STATE_FILE_NAME = 'state.seq.cbor';

export class LocalHistoryCrud implements LocalHistory {
  protected fileOpts: FileOptions = {
    cborEncoder: new CborEncoder(),
  };

  constructor(
    protected readonly crud: CrudApi,
    protected readonly locks: Locks,
  ) {}

  public async create(collection: string[], log: PatchLog): Promise<{id: string}> {
    // TODO: Remove `log.end`, just `log` should be enough.
    const file = new File(log.end, log, this.fileOpts);
    const blob = file.toBinary({
      format: 'seq.cbor',
      model: 'binary',
    });
    const id = genId();
    await this.lock(collection, id, async () => {
      await this.crud.put([...collection, id], STATE_FILE_NAME, blob, {throwIf: 'exists'});
    });
    return {id};
  }

  public async read(collection: string[], id: string): Promise<{log: PatchLog; cursor: string}> {
    const blob = await this.crud.get([...collection, id], STATE_FILE_NAME);
    const {log} = File.fromSeqCbor(blob);
    return {
      log,
      cursor: '',
    };
  }

  public readHistory(collection: string[], id: string, cursor: string): Promise<{log: PatchLog; cursor: string}> {
    throw new Error('Method not implemented.');
  }

  public async update(collection: string[], id: string, patches: Patch[]): Promise<void> {
    await this.lock(collection, id, async () => {
      const blob = await this.crud.get([...collection, id], STATE_FILE_NAME);
      const {log} = File.fromSeqCbor(blob);
      log.end.applyBatch(patches);
      const file = new File(log.end, log, this.fileOpts);
      const blob2 = file.toBinary({
        format: 'seq.cbor',
        model: 'binary',
      });
      await this.crud.put([...collection, id], STATE_FILE_NAME, blob2, {throwIf: 'missing'});
    });
  }

  public async delete(collection: string[], id: string): Promise<void> {
    await this.lock(collection, id, async () => {
      await this.crud.drop(collection, true);
    });
  }

  protected async lock(collection: string[], id: string, fn: () => Promise<void>): Promise<void> {
    const key = collection.join('/') + '/' + id;
    await this.locks.lock(
      key,
      250,
      500,
    )(async () => {
      await fn();
    });
  }
}
