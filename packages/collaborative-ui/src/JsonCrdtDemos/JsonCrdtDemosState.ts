import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtRepo} from 'json-crdt-repo';
import {BehaviorSubject, map, tap} from 'rxjs';
import type {EditSession} from 'json-crdt-repo/lib/session/EditSession';
import type {NiceUiNavService} from 'nice-ui/lib/context/services/NiceUiNavService';
import type {DemoDefinition} from './types';

export interface DemoFilePersistedState {
  files: Omit<OpenDemoFile, 'session'>[];
  selected: string;
}

export interface OpenDemoFile {
  id: string;
  session: EditSession;
}

export interface JsonCrdtDemosStateOpts {
  wsApi?: string;
  basePath: string[];
  nav: NiceUiNavService;
}

export class JsonCrdtDemosState {
  public readonly file$ = new BehaviorSubject<OpenDemoFile | null>(null);
  public readonly sid = Model.sid();
  public readonly repo: JsonCrdtRepo;

  public readonly steps$: BehaviorSubject<string[]>;
  public readonly selected$ = new BehaviorSubject<string>('');

  constructor(public readonly opts: JsonCrdtDemosStateOpts) {
    this.repo = new JsonCrdtRepo({
      wsUrl: opts.wsApi || 'wss://api.jsonjoy.org/rx',
    });
    const basePathLength = this.opts.basePath.length;
    this.steps$ = new BehaviorSubject<string[]>(this.opts.nav.steps$.getValue().slice(basePathLength));
    this.opts.nav.steps$.pipe(map((steps) => steps.slice(basePathLength))).subscribe(this.steps$);

    this.steps$
      .pipe(map((steps) => (steps[0] === 'live' && typeof steps[1] === 'string' ? steps[1] : '')))
      .subscribe(this.selected$);

    this.selected$.subscribe(async (id) => {
      if (!id) {
        this.file$.next(null);
        return;
      }
      const file = this.file$.getValue();
      if (file && file.id === id) return;
      this.file$.next(null);
      try {
        const session = await this.repo.sessions.load({id: ['demo', id], remote: {timeout: 10000, throwIf: 'missing'}});
        const file: OpenDemoFile = {
          id,
          session,
        };
        this.file$.next(file);
      } catch (error) {
        console.error('Could not open file', id);
        console.error(error);
      }
    });
  }

  public readonly select = (id: string) => {
    this.opts.nav.navigate('/' + [...this.opts.basePath, 'live', id].join('/'));
  };

  public readonly create = (definition: DemoDefinition) => {
    const schema = definition.schema;
    const id =
      'demo_' + (Date.now() % 1728578450000).toString(36) + Math.round(Math.random() * 0xffffffff).toString(36);
    const {session} = this.repo.sessions.make({id: ['demo', id], schema});
    const file: OpenDemoFile = {
      id: id,
      session,
    };
    this.file$.next(file);
    this.select(file.id);
  };

  public url(id: string) {
    return `${window.location.protocol}//${window.location.host}${this.opts.basePath.length ? '/' + this.opts.basePath.join('/') : ''}/live/${id}`;
  }
}
