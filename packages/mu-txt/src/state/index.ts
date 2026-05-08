import {Patch} from 'json-joy/lib/json-crdt';
import {Model} from 'json-joy/lib/json-crdt';
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {rsync} from '@jsonjoy.com/ui';
import {BehaviorSubject, map, switchMap, distinctUntilChanged} from 'rxjs';
import {ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {downloadFile, stripExtensions} from './util';
import {type FileLink, type FileMetadataDto, OpenFile} from './file';
import {FileTabsState} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs/state';
import {AppGridState, type SidebarState} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid/state';
import {FileStorage, type IFileStorage} from './file-storage';
import {Menus} from './menus';
import {s} from 'json-joy/lib/json-crdt';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate, type SlateDocument} from '@jsonjoy.com/collaborative-slate';
import {getSyncStore, type ISyncStore} from './sync-store';
import {Theme} from './theme';
import type {TabItem} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup';

const toObservable = <T>(val: rsync.ReactValue<T>): BehaviorSubject<T> => {
  const observable = new BehaviorSubject<T>(val.value);
  val.subscribe(() => observable.next(val.value));
  return observable;
};

const SAVED_REFRESH_INTERVAL_MS = 5_000;
const LEFT_SIZE_STORAGE_KEY = 'mutxt_left_sidebar_size';
const LEFT_SIZE_PERSIST_DEBOUNCE_MS = 300;
const LEFT_STATE_STORAGE_KEY = 'mutxt_left_sidebar_state';

const isSidebarState = (value: string): value is SidebarState =>
  value === 'open' || value === 'close' || value === 'mini' || value === 'none';

const CLOSE_SELECTED_MIN_GAP_MS = 300;
const CLOSE_SELECTED_DESTROY_TIMEOUT_MS = 1500;

const sortSavedFiles = (saved: FileMetadataDto[]): FileMetadataDto[] =>
  [...saved].sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt);

export class MuTxtAppState {
  public readonly tabs: FileTabsState;
  public readonly appGrid = new AppGridState();
  public readonly files$ = new BehaviorSubject<OpenFile[]>([]);
  public readonly selected$: BehaviorSubject<[id: TabItem, index: number] | null>;
  public readonly file$ = new BehaviorSubject<OpenFile | null>(null);
  public readonly sync: ISyncStore;
  public readonly sid: number;
  public readonly saved: rsync.ReactValue<FileMetadataDto[]> = rsync.val([]);
  public readonly menus: Menus;
  public readonly theme: Theme;
  public ondoubleclick: ((file: OpenFile, point: AnchorPoint) => void) | undefined = void 0;
  public onclick: ((file: OpenFile, point: AnchorPoint) => void) | undefined = void 0;
  protected readonly storage: IFileStorage;
  private savedRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private leftSizePersistTimer: ReturnType<typeof setTimeout> | null = null;
  private leftSizeUnsubscribe: (() => void) | null = null;
  private leftStateUnsubscribe: (() => void) | null = null;

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
    this.theme = new Theme(sync);
    this.restoreLeftSidebarSize();
    this.restoreLeftSidebarState();
    this.leftSizeUnsubscribe = this.appGrid.leftSize.subscribe(this.scheduleLeftSidebarSizePersist);
    this.leftStateUnsubscribe = this.appGrid.leftState.subscribe(this.persistLeftSidebarState);
    this.storage = storage;
    this.tabs = new FileTabsState(rsync.val([] as any));
    this.tabs.onNewTab = () => {
      this.createNewMuTxt();
      return void 0;
    };
    this.tabs.onDeleteTab = (tab) => {
      this.disposeFile(tab.id!);
    };
    this.tabs.onTabDoubleClick = (tab, _index, event) => {
      const file = this.fileIfOpen(tab.id!);
      if (!file) return;
      const point: AnchorPoint = {x: event.clientX, y: event.clientY, dx: 1, dy: 1};
      this.ondoubleclick?.(file, point);
    };
    this.tabs.onTabClick = (tab, _index, event) => {
      const file = this.fileIfOpen(tab.id!);
      if (!file) return;
      const point: AnchorPoint = {x: event.clientX, y: event.clientY + 24, dx: 0, dy: 1};
      this.onclick?.(file, point);
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
  private detachDragDrop: (() => void) | null = null;

  private readonly attachDragDrop = (): (() => void) => {
    const hasFiles = (event: DragEvent): boolean =>
      !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');
    const onDragOver = (event: DragEvent): void => {
      if (hasFiles(event)) event.preventDefault();
    };
    const onDrop = (event: DragEvent): void => {
      if (event.defaultPrevented) return;
      const files = event.dataTransfer?.files;
      if (!files || !files.length) return;
      event.preventDefault();
      this.addFiles(Array.from(files));
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  };

  private readonly restoreLeftSidebarSize = (): void => {
    const stored = this.sync.getItem(LEFT_SIZE_STORAGE_KEY);
    if (stored === null) return;
    const value = Number(stored);
    if (!Number.isFinite(value) || value <= 0) return;
    this.appGrid.leftSize.set(value);
  };

  private readonly scheduleLeftSidebarSizePersist = (): void => {
    if (this.leftSizePersistTimer) clearTimeout(this.leftSizePersistTimer);
    this.leftSizePersistTimer = setTimeout(() => {
      this.leftSizePersistTimer = null;
      this.sync.setItem(LEFT_SIZE_STORAGE_KEY, String(this.appGrid.leftSize.value));
    }, LEFT_SIZE_PERSIST_DEBOUNCE_MS);
  };

  private readonly restoreLeftSidebarState = (): void => {
    const stored = this.sync.getItem(LEFT_STATE_STORAGE_KEY);
    if (stored === null) {
      this.appGrid.leftState.set('close');
      return;
    }
    if (!isSidebarState(stored)) return;
    this.appGrid.leftState.set(stored);
  };

  private readonly persistLeftSidebarState = (): void => {
    this.sync.setItem(LEFT_STATE_STORAGE_KEY, this.appGrid.leftState.value);
  };

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
    if (this.stopped) return; // TODO: Is this still needed?
    this.savedRefreshTimer = setInterval(() => {
      void this.refreshSaved();
    }, SAVED_REFRESH_INTERVAL_MS);
    this.detachDragDrop?.();
    this.detachDragDrop = this.attachDragDrop();
    const saved = this.saved.value;

    // Try to reopen the most recently saved file. If there is none, or if it
    // fails to load (e.g. corrupt), fall back to creating a fresh empty
    // document so the user always lands on something usable.
    const opened = saved.length ? await this.openSaved(saved[0].id) : false;
    if (!opened && !this.files$.getValue().length) this.createNewMuTxt();
    this.started.set(true);
  }

  async stop() {
    this.stopped = true;
    this.started.set(false);
    this.stopSavedRefresh();
    this.detachDragDrop?.();
    this.detachDragDrop = null;
    this.leftSizeUnsubscribe?.();
    this.leftSizeUnsubscribe = null;
    this.leftStateUnsubscribe?.();
    this.leftStateUnsubscribe = null;
    if (this.leftSizePersistTimer) {
      clearTimeout(this.leftSizePersistTimer);
      this.leftSizePersistTimer = null;
      this.sync.setItem(LEFT_SIZE_STORAGE_KEY, String(this.appGrid.leftSize.value));
    }
    this.theme.dispose();
    await Promise.all(this.files$.getValue().map((file) => file.destroy(true)));
  }

  public isOpen(id: string) {
    return !!this.fileIfOpen(id);
  }

  public fileIfOpen(id: string): OpenFile | undefined {
    return this.files$.value.find((file) => file.id === id);
  }

  public async openSaved(id: string): Promise<boolean> {
    try {
      if (this.isOpen(id)) {
        this.tabs.selectById(id);
        return true;
      }
      const dto = await this.storage.load(id);
      if (this.stopped) return false;
      const size = dto.data.length;
      await this.addLog(dto.data, dto.name, dto, size);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[mutxt] failed to open file', id, error);
      return false;
    }
  }

  public readonly openFile = (
    log: Log<any>,
    name: string = 'Untitled' + (this.newCnt > 1 ? ` (${this.newCnt})` : ''),
    dto?: FileMetadataDto,
    size: number = 0,
    link?: FileLink,
  ) => {
    const now = Date.now();
    const meta: FileMetadataDto = dto ?? {
      id: Math.random().toString(36).slice(2) + '.' + now.toString(36),
      name,
      createdAt: now,
      updatedAt: now,
      ...(link ? {link} : {}),
    };
    const file = new OpenFile(
      meta,
      log,
      {
        storage: this.storage,
        onPersisted: this.handleFilePersisted,
      },
      size,
    );
    this.files$.next([...this.files$.getValue(), file]);
    this.tabs.add(file.toTab());
    this.tabs.selectById(file.meta.id);
    if (!dto) file.scheduleFlush();
    return file;
  };

  public select(id: string) {
    this.tabs.selectById(id);
  }

  private readonly destroying = new Map<string, Promise<void>>();

  private readonly disposeFile = (id: string) => {
    const list = this.files$.getValue();
    const file = list.find((openFile) => openFile.id === id);
    if (!file) return;
    this.files$.next(list.filter((m) => m.id !== id));
    const promise = file.destroy(true).finally(() => {
      if (this.destroying.get(id) === promise) this.destroying.delete(id);
    });
    this.destroying.set(id, promise);
  };

  public readonly awaitDestroy = async (id: string): Promise<void> => {
    const promise = this.destroying.get(id);
    if (promise) await promise;
  };

  private closeSelectedBusy = false;
  private closeSelectedLastAt = 0;

  public readonly closeSelected = async (): Promise<void> => {
    const now = Date.now();
    if (now - this.closeSelectedLastAt < CLOSE_SELECTED_MIN_GAP_MS) return;
    if (this.closeSelectedBusy) return;
    this.closeSelectedLastAt = now;
    this.closeSelectedBusy = true;
    try {
      const id = this.tabs.selected.value?.[0]?.id ?? this.file$.getValue()?.id;
      const ok = this.tabs.deleteSelected();
      if (!ok) return;
      if (id) {
        const timeout = new Promise<void>((resolve) =>
          setTimeout(resolve, CLOSE_SELECTED_DESTROY_TIMEOUT_MS),
        );
        await Promise.race([this.awaitDestroy(id), timeout]);
      }
      if (typeof requestAnimationFrame === 'function') {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('mutxt:close-selected failed', err);
    } finally {
      this.closeSelectedBusy = false;
    }
  };

  public readonly close = (id: string) => {
    this.tabs.deleteById(id);
    // tabs.deleteById fires onDeleteTab → disposeFile, which handles file
    // teardown. Falling back here covers callers where the tab had already
    // been removed externally.
    this.disposeFile(id);
  };

  public readonly closeAll = () => {
    const files = this.files$.getValue();
    for (const file of files) this.close(file.id);
  };

  public readonly rename = async (id: string, name: string): Promise<void> => {
    const file = this.files$.getValue().find((m) => m.id === id);
    if (file) {
      this.renameFile(file, name);
      return;
    }
    try {
      await this.storage.renameMeta(id, name);
      await this.refreshSaved();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[mutxt] failed to rename saved file', id, error);
    }
  };

  public renameFile(file: OpenFile, name: string): void {
    if (file.name.value === name) return;
    file.name.set(name);
  }

  public async deleteSaved(id: string) {
    this.tabs.deleteById(id);
    await this.awaitDestroy(id);
    await this.storage.delete(id);
    await this.refreshSaved();
  }

  public readonly addFile = async (file: File, link?: FileLink) => {
    if (!file) return;
    const uint8 = new Uint8Array(await file.arrayBuffer());
    const name = file.name ? stripExtensions(file.name) : 'model';
    try {
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
        this.openFile(log, name, undefined, 0, link);
        return;
      }
      if (file.name.endsWith('.crdt')) {
        let bytes = uint8;
        try {
          bytes = (await ungzip(bytes)) as Uint8Array<ArrayBuffer>;
        } catch {}
        const model = ModelWithExt.load(bytes, this.sid);
        const log = new Log(() => model);
        log.end.setSid(this.sid);
        this.openFile(log, name, undefined, 0, link);
        return;
      }
      await this.addLog(uint8, name, undefined, 0, link);
      return;
    } catch {}
    this.createNewMuTxtWithFile(file, uint8, name, link);
  };

  public readonly addLog = async (
    uint8: Uint8Array,
    name?: string,
    dto?: FileMetadataDto,
    size: number = 0,
    link?: FileLink,
  ) => {
    let log: Log<any>;
    try {
      log = await OpenFile.decodeLog(uint8, this.sid);
    } catch {
      let bytes = uint8;
      try {
        bytes = (await ungzip(bytes)) as Uint8Array<ArrayBuffer>;
      } catch {}
      const model = ModelWithExt.load(bytes, this.sid);
      log = new Log(() => model);
      log.end.setSid(this.sid);
    }
    if (this.stopped) return;
    this.openFile(log, name, dto, size, link);
  };

  public readonly addFiles = async (files: File[]) => {
    files.map((file) => this.addFile(file).catch(() => {}));
  };

  private newCnt = 0;

  public readonly createNew = (data: unknown = void 0, name?: string, link?: FileLink) => {
    // const schema = s.obj(data);
    const model = ModelWithExt.create<any>(data, this.sid);
    this.createFromModel(model, name, link);
  };

  public readonly createNewMuTxt = (name?: string, link?: FileLink) => {
    this.createNew(s.obj({'@type': s.con('mutxt'), text: ext.peritext.new('')}), name, link);
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

  public readonly createNewMuTxtWithFile = (file: File, bytes: Uint8Array, name?: string, link?: FileLink) => {
    const thingId = `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const model = ModelWithExt.create<any>(
      s.obj({
        '@type': s.con('mutxt'),
        text: ext.peritext.new(''),
        things: s.obj({}),
      }),
      this.sid,
    );
    model.api.obj(['things']).set({
      [thingId]: {
        '@type': 'file',
        '@id': thingId,
        name: file.name || 'file',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: s.con(bytes),
      },
    });
    const peritextApi = model.api.in('text').asExt(ext.peritext);
    const txt = peritextApi.peritext();
    const slate: SlateDocument = [
      {type: 'file', '@thing': thingId, children: [{text: ''}]} as any,
      {type: 'p', children: [{text: ''}]} as any,
    ];
    const viewRange = FromSlate.convert(slate);
    txt.editor.import(0, viewRange);
    txt.refresh();
    this.newCnt++;
    const log = Log.from(model);
    this.openFile(log, name ?? file.name, undefined, 0, link);
  };

  public readonly createFromModel = (model: Model<any>, name?: string, link?: FileLink) => {
    this.newCnt++;
    const log = Log.fromNewModel(model);
    this.openFile(log, name, undefined, 0, link);
  };

  public async download(id: string) {
    const {name, data} = await this.storage.load(id);
    downloadFile(data, `${name}.seq.cbor.gz`);
  }
}
