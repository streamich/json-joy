import * as React from 'react';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import {LogDecoder} from 'json-joy/lib/json-crdt/log/codec/LogDecoder';
import {JsonCrdtLogState} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog/JsonCrdtLogState';
import {rsync} from '@jsonjoy.com/ui';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {LogEncoder} from 'json-joy/lib/json-crdt/log/codec/LogEncoder';
import {compact} from 'json-joy/lib/json-crdt-patch/compaction';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {DebounceQueue} from '../util/DebounceQueue';
import {host} from '../util/host';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';
import type {TabItem} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';
import type {MuTxtApi} from 'mutxt-react';
import type {IFileStorage} from './file-storage';
import type {Model} from 'json-joy/lib/json-crdt';

const RenderName: React.FC<{file: OpenFile}> = ({file}) => {
  const name = file.name.use();
  return <>{name}</>;
};

export interface FileMetadataDto {
  /** Unique constant identifier for the file. */
  id: string;
  /** A custom human-readable name for the file that user can edit in UI. */
  name: string;
  /** Timestamp when file was created. */
  createdAt: number;
  /** Timestamp when file was last updated or saved. */
  updatedAt: number;
  /**
   * Optional link to an external location where this file was opened from
   * and where its contents can be saved back to.
   */
  link?: FileLink;
}

/**
 * Link from an internally stored file to an external location.
 */
export interface FileLink {
  /** The access mechanism / provider used to reach the external file. */
  source: string;
  /** Locator within the source — filesystem path, provider id, etc. */
  path: string;
}

export interface FileDto extends FileMetadataDto {
  data: Uint8Array;
}

export interface OpenFileOptions {
  storage?: IFileStorage;
  flushDebounceMs?: number;
  onPersisted?: ((meta: FileMetadataDto) => void | Promise<void>) | undefined;
}

export const DEFAULT_FLUSH_DEBOUNCE_MS = 250;

export class OpenFile {
  public readonly id: string;
  public readonly openTime: number = Date.now();
  public readonly name: rsync.ReactValue<string>;
  public readonly logState: JsonCrdtLogState;
  public readonly activeModel: rsync.ReactValue<Model<any>>;
  private readonly storage?: IFileStorage;
  private readonly flushDebounceMs: number;
  private readonly onPersisted?: (meta: FileMetadataDto) => void | Promise<void>;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingFlush = false;
  private saving = false;
  private active = true;
  private disposeAfterSave = false;
  private readonly unsubscribers: Array<() => void> = [];
  public mutxt?: MuTxtApi;

  constructor(
    public readonly meta: FileMetadataDto,
    public readonly log: Log<any>,
    options: OpenFileOptions = {},
    public size: number = 0,
  ) {
    this.id = meta.id;
    this.name = rsync.val(meta.name);
    this.logState = new JsonCrdtLogState(log, {view: 'tiny'});
    this.logState.patchState.toggleShow(false);
    this.activeModel = rsync.val(log.end);
    this.storage = options.storage;
    this.flushDebounceMs = options.flushDebounceMs ?? DEFAULT_FLUSH_DEBOUNCE_MS;
    this.onPersisted = options.onPersisted;
    this.attachPersistenceListeners();

    // Schedule CRDT operation flushing.
    const queue = new DebounceQueue<null>(100, 500);
    queue.onflush = () => {
      const patch = api.builder.patch;
      if (patch.ops.length) {
        compact(patch);
        api.flush();
      }
    };
    const api = log.end.api;
    const enqueue = () => queue.push(null);
    api.onLocalChanges.listen(enqueue);
    api.onBeforeTransaction.listen(enqueue);
    api.onTransaction.listen(enqueue);
  }

  public static async decodeLog(uint8: Uint8Array, sid: number): Promise<Log<any>> {
    try {
      uint8 = await ungzip(uint8);
    } catch {}
    const cborDecoder = new CborDecoder();
    const decoder = new LogDecoder({cborDecoder});
    const {history: log} = decoder.decode(uint8, {history: true, frontier: true, format: 'seq.cbor'});
    if (!log) throw new Error('Incompatible JSON CRDT log file.');
    const start = log.start;
    log.start = () => {
      const model = start();
      model.ext.register(ext.peritext);
      model.ext.register(ext.quill);
      return model;
    };
    log.end.ext.register(ext.peritext);
    log.end.ext.register(ext.quill);
    log.end.setSid(sid);
    return log;
  }

  private readonly attachPersistenceListeners = () => {
    if (!this.storage || this.unsubscribers.length) return;
    this.unsubscribers.push(
      this.name.subscribe(() => this.scheduleFlush()),
      this.log.end.api.onPatch.listen(() => this.scheduleFlush()),
      this.log.end.api.onFlush.listen(() => this.scheduleFlush()),
    );
  };

  private readonly clearFlushTimer = () => {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  };

  private readonly finalizeDisposal = () => {
    this.clearFlushTimer();
    this.disposeAfterSave = false;
  };

  public toMeta(): FileMetadataDto {
    const meta: FileMetadataDto = {
      id: this.meta.id,
      name: this.name.value,
      createdAt: this.meta.createdAt,
      updatedAt: Date.now(),
    };
    if (this.meta.link) meta.link = this.meta.link;
    return meta;
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
    const dto: FileDto = this.toMeta() as FileDto;
    dto.data = encoded;
    return dto;
  }

  // Write a `.toBinary()` snapshot of the current model to the linked external
  // location (e.g. local fs in Electron). OPFS keeps the full CRDT log; the
  // linked file holds only the latest snapshot.
  private readonly writeLinkedSnapshot = async (): Promise<void> => {
    const link = this.meta.link;
    if (!link) return;
    if (link.source !== 'native-fs' || !host) return;
    try {
      const snapshot = this.log.end.toBinary();
      await host.writeFile(link.path, snapshot);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[mutxt] failed to write linked file', link.path, err);
    }
  };

  public readonly scheduleFlush = () => {
    if (!this.storage || !this.active) return;
    this.pendingFlush = true;
    this.clearFlushTimer();
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, this.flushDebounceMs);
  };

  public readonly flush = async () => {
    const storage = this.storage;
    if (!storage || this.saving || !this.pendingFlush) {
      if (this.disposeAfterSave && !this.saving && !this.pendingFlush) this.finalizeDisposal();
      return;
    }
    this.pendingFlush = false;
    this.saving = true;
    const dto = this.toDto();
    try {
      await storage.save(dto);
      this.meta.name = dto.name;
      this.meta.updatedAt = dto.updatedAt;
      const onPersisted = this.onPersisted;
      if (onPersisted) await onPersisted(dto);
      await this.writeLinkedSnapshot();
    } catch {
    } finally {
      this.saving = false;
    }
    if (this.disposeAfterSave && !this.pendingFlush) {
      this.finalizeDisposal();
      return;
    }
    if (this.pendingFlush) this.scheduleFlush();
  };

  public readonly destroy = async (flushPending = false) => {
    if (!this.active && !this.saving) return;
    this.active = false;
    this.clearFlushTimer();
    while (this.unsubscribers.length) {
      const unsubscribe = this.unsubscribers.pop();
      unsubscribe?.();
    }
    if (flushPending && this.pendingFlush) {
      this.disposeAfterSave = true;
      await this.flush();
      return;
    }
    if (this.saving) {
      this.disposeAfterSave = true;
      return;
    }
    this.finalizeDisposal();
  };

  public toTab(): TabItem {
    return {
      id: this.id,
      name: this.name.value,
      display: () => <RenderName file={this} />,
      icon: () => (
        <FileIcon id={this.id} label={this.name.value} gradient accent size={16} link={!!this.meta.link} />
      ),
    };
  }
}
