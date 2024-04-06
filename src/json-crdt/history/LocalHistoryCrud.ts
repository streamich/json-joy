import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import {CborDecoder} from '../../json-pack/cbor/CborDecoder';
import {LogEncoder} from '../log/codec/LogEncoder';
import {LogDecoder} from '../log/codec/LogDecoder';
import type {CrudApi} from 'memfs/lib/crud/types';
import type {Locks} from 'thingies/es2020/Locks';
import type {Patch} from '../../json-crdt-patch';
import type {Log} from '../log/Log';
import type {LocalHistory} from './types';

export const genId = (octets: number = 8): string => {
  const uint8 = crypto.getRandomValues(new Uint8Array(octets));
  let hex = '';
  for (let i = 0; i < octets; i++) hex += uint8[i].toString(16).padStart(2, '0');
  return hex;
};

const STATE_FILE_NAME = 'state.seq.cbor';

export class LocalHistoryCrud implements LocalHistory {
  protected encoder: LogEncoder = new LogEncoder({
    cborEncoder: new CborEncoder(),
  });
  protected decoder: LogDecoder = new LogDecoder({
    cborDecoder: new CborDecoder(),
  });

  constructor(
    protected readonly crud: CrudApi,
    protected readonly locks: Locks,
  ) {}

  public async create(collection: string[], log: Log, id: string = genId()): Promise<{id: string}> {
    const blob = this.encode(log);
    await this.lock(collection, id, async () => {
      await this.crud.put([...collection, id], STATE_FILE_NAME, blob, {throwIf: 'exists'});
    });
    return {id};
  }

  protected encode(log: Log): Uint8Array {
    // TODO: Add browser-native compression. Wrap the blob into `[]` TLV tuple.
    return this.encoder.encode(log, {
      format: 'seq.cbor',
      model: 'binary',
      history: 'binary',
      noView: true,
    });
  }

  public async read(collection: string[], id: string): Promise<{log: Log; cursor: string}> {
    const blob = await this.crud.get([...collection, id], STATE_FILE_NAME);
    const {frontier} = this.decoder.decode(blob, {format: 'seq.cbor', frontier: true});
    return {
      log: frontier!,
      cursor: '1',
    };
  }

  public async readHistory(collection: string[], id: string, cursor: string): Promise<{log: Log; cursor: string}> {
    const blob = await this.crud.get([...collection, id], STATE_FILE_NAME);
    const {history} = this.decoder.decode(blob, {format: 'seq.cbor', history: true});
    return {
      log: history!,
      cursor: '',
    };
  }

  public async update(collection: string[], id: string, patches: Patch[]): Promise<void> {
    await this.lock(collection, id, async () => {
      const blob = await this.crud.get([...collection, id], STATE_FILE_NAME);
      const decoded = this.decoder.decode(blob, {format: 'seq.cbor', history: true});
      const log = decoded.history!;
      log.end.applyBatch(patches);
      const blob2 = this.encode(log);
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
