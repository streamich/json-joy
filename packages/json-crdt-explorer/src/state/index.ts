import {Model, Patch, s} from 'json-joy/lib/json-crdt';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {rsync} from '@jsonjoy.com/ui';
import {BehaviorSubject, map, switchMap} from 'rxjs';
import {ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {stripExtensions} from './util';
import {FileMetadataDto, OpenFile} from './file';
import {FileTabsState} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs/state';
import {FileStorage, IFileStorage} from './file-storage';
import {Menus} from './menus';
import type {TraceDefinition} from './traces';

const toObservable = <T>(val: rsync.ReactValue<T>): BehaviorSubject<T> => {
  const observable = new BehaviorSubject<T>(val.value);
  val.subscribe(() => observable.next(val.value));
  return observable;
};

const SAVED_REFRESH_INTERVAL_MS = 5_000;

const sortSavedFiles = (saved: FileMetadataDto[]): FileMetadataDto[] =>
  [...saved].sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt);

export class JsonCrdtExplorerState {
  public readonly tabs: FileTabsState;
  public readonly files$ = new BehaviorSubject<OpenFile[]>([]);
  public readonly selected$ = new BehaviorSubject<string>('');
  public readonly file$ = new BehaviorSubject<OpenFile | null>(null);
  public readonly sid = Model.sid();
  public readonly saved: rsync.ReactValue<FileMetadataDto[]> = rsync.val([]);
  public readonly menus: Menus;
  protected readonly storage: IFileStorage;
  private savedRefreshTimer: ReturnType<typeof setInterval> | null = null;
  
  constructor(storage: IFileStorage = new FileStorage()) {
    this.menus = new Menus(this);
    this.storage = storage;
    this.tabs = new FileTabsState(rsync.val([] as any));
    this.tabs.onNewTab = () => {
      this.createNew({});
      return void 0;
    };
    this.tabs.onDeleteTab = (tab) => {
      this.close(tab.id!);
    };
    this.files$
      .pipe(
        switchMap(() => toObservable(this.tabs.selected)),
        map((selected) => {
          if (!selected) return null;
          const files = this.files$.getValue();
          return files.find((file) => file.id === selected[0].id) ?? null;
        }),
      )
      .subscribe(this.file$);
  }

  private stopped = false;

  private readonly stopSavedRefresh = () => {
    if (this.savedRefreshTimer) {
      clearInterval(this.savedRefreshTimer);
      this.savedRefreshTimer = null;
    }
  };

  private readonly refreshSaved = async () => {
    try {
      const saved = await this.storage.list();
      if (this.stopped) return;
      this.saved.next(sortSavedFiles(saved));
    } catch {}
  };

  private readonly handleFilePersisted = async () => {
    await this.refreshSaved();
  };

  async start() {
    this.stopped = false;
    this.stopSavedRefresh();
    await this.refreshSaved();
    if (this.stopped) return;
    this.savedRefreshTimer = setInterval(() => {
      void this.refreshSaved();
    }, SAVED_REFRESH_INTERVAL_MS);
    // if (saved.length) await this.openSaved(saved[0].id);
  }

  async stop() {
    this.stopped = true;
    this.stopSavedRefresh();
    await Promise.all(this.files$.getValue().map((file) => file.destroy(true)));
  }

  public isOpen(id: string) {
    return !!this.files$.value.find((file) => file.id === id);
  }

  public async openSaved(id: string) {
    if (this.isOpen(id)) {
      this.tabs.selectById(id);
      return;
    }
    const dto = await this.storage.load(id);
    if (this.stopped) return;
    await this.addLog(dto.data, dto.name, dto.display, dto);
  }

  public readonly openFile = (
    log: Log<any>,
    name: string = 'JSON CRDT document' + (this.newCnt > 1 ? ` (${this.newCnt})` : ''),
    dto?: FileMetadataDto,
  ) => {
    const now = Date.now();
    const meta: FileMetadataDto = dto ?? {
      id: Math.random().toString(36).slice(2) + '.' + now.toString(36),
      name,
      createdAt: now,
      updatedAt: now,
    };
    const file = new OpenFile(meta, log, {
      storage: this.storage,
      onPersisted: this.handleFilePersisted,
    });
    this.files$.next([...this.files$.getValue(), file]);
    this.tabs.add(file.toTab());
    this.tabs.selectById(file.meta.id);
    if (!dto) file.scheduleFlush();
    return file;
  };

  public select(id: string) {
    this.tabs.selectById(id);
  }

  public readonly close = (id: string) => {
    this.tabs.deleteById(id);
    const file = this.files$.getValue().find((openFile) => openFile.id === id);
    void file?.destroy(true);
    const list = this.files$.getValue().filter((m) => m.id !== id);
    this.files$.next(list);
    // const files = this.files$.getValue();
    // if (files.length && !this.file$.getValue()) this.tabs.selectById(files[0].id);
  };

  public readonly closeAll = () => {
    const files = this.files$.getValue();
    for (const file of files) this.close(file.id);
  };

  public readonly rename = (id: string, name: string) => {
    const files = this.files$.getValue();
    const file = files.find((m) => m.id === id);
    if (!file || file.name.value === name) return;
    file.name.set(name);
    this.files$.next([...files]);
  };

  public async deleteSaved(id: string) {
    this.tabs.deleteById(id);
    const file = this.files$.getValue().find((m) => m.id === id);
    if (file) await file.destroy();
    await this.storage.delete(id);
    await this.refreshSaved();
  }

  public readonly addFile = async (file: File) => {
    if (!file) return;
    let uint8 = new Uint8Array(await file.arrayBuffer());
    const name = file.name ? stripExtensions(file.name) : 'model';
    if (file.name.endsWith('patches.bin')) {
      const cborDecoder = new CborDecoder();
      const array = cborDecoder.decode(uint8) as Uint8Array[];
      if (!Array.isArray(array)) throw new Error('Incompatible JSON CRDT log file.');
      const patches: Patch[] = array.map((patch) => Patch.fromBinary(patch));
      const lastPatch = patches[patches.length - 1];
      if (!lastPatch) throw new Error('Incompatible JSON CRDT log file.');
      const id = lastPatch.getId();
      if (!id) throw new Error('Incompatible JSON CRDT log file.');
      const model = Model.create(undefined, id.sid);
      const log = new Log(() => model.clone());
      log.end.applyBatch(patches);
      log.end.api.autoFlush();
      log.end.setSid(this.sid);
      this.openFile(log, name);
    }
    if (file.name.endsWith('.crdt')) {
      try {
        uint8 = (await ungzip(uint8)) as Uint8Array<ArrayBuffer>;
      } catch {}
      const model = Model.load(uint8, this.sid);
      const log = new Log(() => model);
      log.end.api.autoFlush();
      log.end.setSid(this.sid);
      this.openFile(log, name);
    } else if (
      file.name.endsWith('.cbor.gz') ||
      file.name.endsWith('.seq.cbor') ||
      file.name.endsWith('.seq.cbor.gz')
    ) {
      await this.addLog(uint8, name);
    }
  };

  public readonly addLog = async (uint8: Uint8Array, name?: string, display?: TraceDefinition['display'], dto?: FileMetadataDto) => {
    const log = await OpenFile.decodeLog(uint8, this.sid);
    if (this.stopped) return;
    const file = this.openFile(log, name, dto);
    file.setDisplay(display);
  };

  public readonly addTrace = async (uint8: Uint8Array, trace: TraceDefinition) => {
    return await this.addLog(uint8, trace.name, trace.display);
  };

  public readonly addFiles = async (files: File[]) => {
    files.map((file) => this.addFile(file).catch(() => {}));
  };

  private newCnt = 0;

  public readonly createNew = (data: unknown = void 0) => {
    // const schema = s.obj(data);
    const model = Model.create<any>(data, this.sid);
    this.createFromModel(model);
  };

  public readonly createFromModel = (model: Model<any>) => {
    this.newCnt++;
    const log = Log.fromNewModel(model);
    log.end.api.autoFlush();
    this.openFile(log);
  };
}
