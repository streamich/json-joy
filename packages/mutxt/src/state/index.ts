import {Patch} from 'json-joy/lib/json-crdt';
import {Model} from 'json-joy/lib/json-crdt';
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {rsync} from '@jsonjoy.com/ui';
import {BehaviorSubject, map, switchMap, distinctUntilChanged} from 'rxjs';
import {ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {downloadFile, stripExtensions} from './util';
import {type FileMetadataDto, OpenFile} from './file';
import {FileTabsState} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs/state';
import {FileStorage, type IFileStorage} from './file-storage';
import {Menus} from './menus';
import {s} from 'json-joy/lib/json-crdt';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate, type SlateDocument} from '@jsonjoy.com/collaborative-slate';
import {getSyncStore, type ISyncStore} from './sync-store';
import type {TraceDefinition} from './traces';
import type {TabItem} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';

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
  public readonly selected$: BehaviorSubject<[id: TabItem, index: number] | null>;
  public readonly file$ = new BehaviorSubject<OpenFile | null>(null);
  public readonly sync: ISyncStore;
  public readonly sid: number;
  public readonly saved: rsync.ReactValue<FileMetadataDto[]> = rsync.val([]);
  public readonly menus: Menus;
  protected readonly storage: IFileStorage;
  private savedRefreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(storage: IFileStorage = new FileStorage()) {
    const sync = (this.sync = getSyncStore());
    const sid = sync.getItem('json_joy_sid');
    if (sid) {
      this.sid = Number(sid);
    } else {
      this.sid = Model.sid();
      sync.setItem('json_joy_sid', this.sid.toString());
    }
    this.menus = new Menus(this);
    this.storage = storage;
    this.tabs = new FileTabsState(rsync.val([] as any));
    this.tabs.onNewTab = () => {
      this.createNewMuTxt();
      return void 0;
    };
    this.tabs.onDeleteTab = (tab) => {
      this.close(tab.id!);
    };
    this.selected$ = toObservable(this.tabs.selected);
    this.files$
      .pipe(
        switchMap(() => this.selected$),
        map((selected) => {
          if (!selected) return null;
          const files = this.files$.getValue();
          return files.find((file) => file.id === selected[0].id) ?? null;
        }),
        distinctUntilChanged(),
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

  public started = rsync.val(false);

  async start() {
    this.stopped = false;
    this.stopSavedRefresh();
    await this.refreshSaved();
    if (this.stopped) return; // TODO: Is this still needed.
    this.savedRefreshTimer = setInterval(() => {
      void this.refreshSaved();
    }, SAVED_REFRESH_INTERVAL_MS);
    const saved = this.saved.value;
    if (saved.length) await this.openSaved(saved[0].id);
    else this.createNewMuTxt();
    this.started.set(true);
  }

  async stop() {
    this.stopped = true;
    this.started.set(false);
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
    name: string = 'Untitled' + (this.newCnt > 1 ? ` (${this.newCnt})` : ''),
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
    if (!file) return;
    this.renameFile(file, name);
  };

  public renameFile(file: OpenFile, name: string): void {
    if (file.name.value === name) return;
    file.name.set(name);
  }

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
      const model = ModelWithExt.create(undefined, id.sid);
      const log = new Log(() => model.clone());
      log.end.applyBatch(patches);
      log.end.setSid(this.sid);
      this.openFile(log, name);
    }
    if (file.name.endsWith('.crdt')) {
      try {
        uint8 = (await ungzip(uint8)) as Uint8Array<ArrayBuffer>;
      } catch {}
      const model = ModelWithExt.load(uint8, this.sid);
      const log = new Log(() => model);
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

  public readonly addLog = async (
    uint8: Uint8Array,
    name?: string,
    display?: TraceDefinition['display'],
    dto?: FileMetadataDto,
  ) => {
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
    const model = ModelWithExt.create<any>(data, this.sid);
    this.createFromModel(model);
  };

  public readonly createNewMuTxt = () => {
    this.createNew(s.obj({'@type': s.con('mutxt'), text: ext.peritext.new('')}));
  };

  public readonly createNewMuTxtFromSlate = (slate: SlateDocument, name?: string) => {
    const model = ModelWithExt.create<any>(s.obj({'@type': s.con('mutxt'), text: ext.peritext.new('')}), this.sid);
    const peritextApi = model.api.in('text').asExt(ext.peritext);
    const txt = peritextApi.peritext();
    const viewRange = FromSlate.convert(slate);
    txt.editor.import(0, viewRange);
    txt.refresh();
    this.newCnt++;
    const log = Log.from(model);
    this.openFile(log, name);
  };

  public readonly createFromModel = (model: Model<any>) => {
    this.newCnt++;
    const log = Log.fromNewModel(model);
    this.openFile(log);
  };

  public async download(id: string) {
    const {name, data} = await this.storage.load(id);
    downloadFile(data, `${name}.seq.cbor.gz`);
  }
}
