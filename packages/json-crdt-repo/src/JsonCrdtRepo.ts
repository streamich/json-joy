import {BrowserLevel} from 'browser-level';
import {createBinaryClient} from '@jsonjoy.com/rpc-client';
import {type DemoServerClient, DemoServerRemoteHistory} from './remote/DemoServerRemoteHistory';
import {EditSessionFactory} from './session/EditSessionFactory';
import {PubSubBC} from './pubsub';
import {Locks} from 'thingies/lib/Locks';
import {LevelLocalRepo, type LevelLocalRepoOpts} from './local/level/LevelLocalRepo';
import {Model} from 'json-joy/lib/json-crdt';
import {onLine$} from 'rx-use/lib/onLine$';
import type {BinStrLevel, LevelLocalRepoPubSubMessage} from './local/level/types';
import type {EditSession} from './session/EditSession';

let LS: Record<string, string> = {};
try {
  LS = window.localStorage;
  (LS as any).getItem('test');
} catch {
  LS = {};
}

export interface JsonCrdtRepoOpts {
  name: string;
  wsUrl: string;
}

export class JsonCrdtRepo {
  public readonly repo: LevelLocalRepo;
  public readonly sessions: EditSessionFactory;
  public readonly opts: JsonCrdtRepoOpts;
  public readonly remote: DemoServerRemoteHistory;
  public readonly client: DemoServerClient;

  constructor(opts?: Partial<JsonCrdtRepoOpts>) {
    this.opts = {
      name: opts?.name ?? 'json-crdt-repo',
      wsUrl: opts?.wsUrl ?? 'wss://pub-1-api.jsonjoy.org/rx',
      ...opts,
    };
    const client = (this.client = createBinaryClient(this.opts.wsUrl) as DemoServerClient);
    const sid: number = this.readSid();
    const clientId = (sid % 0xfffffffe) + 1;
    this.remote = new DemoServerRemoteHistory(client, clientId);
    const kv: BinStrLevel = new BrowserLevel(this.opts.name, {
      keyEncoding: 'utf8',
      valueEncoding: 'view',
    }) as any;
    const pubsub = new PubSubBC<LevelLocalRepoPubSubMessage>(this.opts.name);
    const locks = new Locks();
    const connected$ = onLine$ as LevelLocalRepoOpts['connected$'];
    const repo = (this.repo = new LevelLocalRepo({
      kv,
      locks,
      sid,
      rpc: this.remote,
      pubsub,
      connected$,
    }));
    this.sessions = new EditSessionFactory({
      repo,
      sid,
    });
  }

  public readSid(): number {
    const key = this.opts.name + '-sid';
    const value = LS[key];
    if (value) return +value;
    const sid: number = Model.sid();
    LS[key] = sid + '';
    return sid;
  }

  public genId(): string {
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  public make(id: string | string[] = ['default', this.genId()]): EditSession {
    const {session} = this.sessions.make({id: Array.isArray(id) ? id : ['default', id]});
    return session;
  }
}
