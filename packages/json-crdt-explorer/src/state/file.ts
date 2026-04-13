import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {JsonCrdtLogState} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog/JsonCrdtLogState';
import {rsync} from '@jsonjoy.com/ui';
import type {DemoComp} from '@jsonjoy.com/collaborative-ui/lib//DemoDisplay';
import {LogEncoder} from 'json-joy/lib/json-crdt/log/codec/LogEncoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';

export interface FileMetadataDto {
  /** Unique constant identifier for the file. */
  id: string;
  /** A custom human-readable name for the file that user can edit in UI. */
  name: string;
  /** Timestamp when file was created. */
  createdAt: number;
  /** Timestamp when file was last updated or saved. */
  updatedAt: number;
  // format: 'model' | 'log';
}

export interface FileDto extends FileMetadataDto {
  data: Uint8Array;
}

export class OpenFile {
  public readonly openTime: number = Date.now();
  public readonly name: rsync.ReactValue<string>;
  public readonly logState: JsonCrdtLogState;
  public readonly display?: DemoComp = void 0;

  constructor (
    public readonly meta: FileMetadataDto,
    public readonly log: Log<any>,
  ) {
    this.name = rsync.val(meta.name);
    this.logState = new JsonCrdtLogState(log, {view: 'model'});
  }

  public toDto(): FileDto {
    const cborEncoder = new CborEncoder();
    const encoder = new LogEncoder({cborEncoder});
    const encoded = encoder.encode(this.log, {
      format: 'seq.cbor',
      history: 'binary',
      model: 'none',
      noView: true,
    });
    const dto: FileDto = {
      id: this.meta.id,
      name: this.name.value,
      createdAt: this.openTime,
      updatedAt: Date.now(),
      data: encoded,
    };
    return dto;
  }
}
