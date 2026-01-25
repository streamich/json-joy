import {Model, Patch, s} from 'json-joy/lib/json-crdt';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {LogDecoder} from 'json-joy/lib/json-crdt/log/codec/LogDecoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {BehaviorSubject, map, switchMap} from 'rxjs';
import {ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {stripExtensions} from './util';
import {JsonCrdtLogState} from '../JsonCrdtLog/JsonCrdtLogState';
import type {TraceDefinition} from './TraceSelector/traces';
import type {DemoComp} from '../DemoDisplay';

export interface OpenFile {
  id: string;
  openTime: number;
  log: Log<any>;
  name: string;
  logState: JsonCrdtLogState;
  display?: DemoComp;
}

export class JsonCrdtExplorerState {
  public readonly files$ = new BehaviorSubject<OpenFile[]>([]);
  public readonly selected$ = new BehaviorSubject<string>('');
  public readonly file$ = new BehaviorSubject<OpenFile | null>(null);
  public readonly sid = Model.sid();

  constructor() {
    this.files$
      .pipe(
        switchMap(() => this.selected$),
        map((selected) => {
          if (!selected) return null;
          const files = this.files$.getValue();
          return files.find((file) => file.id === selected) ?? null;
        }),
      )
      .subscribe(this.file$);
  }

  public readonly select = (id: string) => {
    this.selected$.next(id);
  };

  public readonly openFile = (
    log: Log<any>,
    name: string = 'JSON CRDT document' + (this.newCnt > 1 ? ` (${this.newCnt})` : ''),
  ) => {
    const now = Date.now();
    const logState = new JsonCrdtLogState(log, {view: 'model'});
    const file: OpenFile = {
      id: Math.random().toString(36).slice(2) + '.' + now,
      openTime: now,
      log,
      name,
      logState,
    };
    this.files$.next([...this.files$.getValue(), file]);
    this.select(file.id);
    return file;
  };

  public readonly close = (id: string) => {
    const list = this.files$.getValue().filter((m) => m.id !== id);
    this.files$.next(list);
    const files = this.files$.getValue();
    if (files.length && !this.file$.getValue()) this.select(files[0].id);
  };

  public readonly rename = (id: string, name: string) => {
    const files = this.files$.getValue();
    const file = files.find((m) => m.id === id);
    if (!file) return;
    file.name = name;
    this.files$.next([...files]);
  };

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

  public readonly addLog = async (uint8: Uint8Array, name?: string, display?: TraceDefinition['display']) => {
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
      model.ext.register(ext.quill);
      return model;
    };
    log.end.ext.register(ext.quill);
    log.end.api.autoFlush();
    log.end.setSid(this.sid);
    const file = this.openFile(log, name);
    file.display = display;
    if (file.display === 'text') {
      const logState = file.logState;
      logState.patchState.show$.next(false);
      logState.modelState.showModel$.next(false);
      logState.modelState.showView$.next(false);
      logState.modelState.showDisplay$.next(true);
    } else if (file.display === 'blogpost' || file.display === 'todo') {
      const logState = file.logState;
      logState.patchState.show$.next(false);
      logState.modelState.showModel$.next(false);
      logState.modelState.showView$.next(true);
      logState.modelState.showDisplay$.next(true);
    } else if (file.display === 'quill') {
      const logState = file.logState;
      logState.patchState.show$.next(false);
      logState.modelState.showModel$.next(false);
      logState.modelState.showView$.next(true);
      logState.modelState.showDisplay$.next(true);
    }
  };

  public readonly addTrace = async (uint8: Uint8Array, trace: TraceDefinition) => {
    return await this.addLog(uint8, trace.name, trace.display);
  };

  public readonly addFiles = async (files: File[]) => {
    files.map((file) => this.addFile(file).catch(() => {}));
  };

  private newCnt = 0;

  public readonly createNew = () => {
    const schema = s.obj({});
    const model = Model.create<any>(schema, this.sid);
    this.createFromModel(model);
  };

  public readonly createFromModel = (model: Model<any>) => {
    this.newCnt++;
    const log = Log.fromNewModel(model);
    log.end.api.autoFlush();
    this.openFile(log);
  };
}
