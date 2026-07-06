import {mkdtempSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {MemoryLevel} from 'memory-level';
import {CalleeCaller} from '@jsonjoy.com/rpc-calls/lib/caller/CalleeCaller';
import {createCaller} from '../routes';
import {LevelStore} from '../services/blocks/store/level/LevelStore';
import {Services} from '../services/Services';
import {ClassicLevel} from 'classic-level';
import {MemoryStore} from '../services/blocks/store/MemoryStore';
import type {Store} from '../services/blocks/store/types';

const deepClone = (val: unknown): unknown => {
  if (val instanceof Uint8Array) return new Uint8Array(val);
  if (Array.isArray(val)) return val.map(deepClone);
  if (val !== null && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val)) out[k] = deepClone((val as Record<string, unknown>)[k]);
    return out;
  }
  return val;
};

export const setup = async (store: Store = new MemoryStore(), close?: () => Promise<void>) => {
  const services = new Services({store});
  const {caller} = createCaller(services);
  const client = new CalleeCaller(caller.rpc as any, {} as any);
  const call = async (method: string, req?: unknown): Promise<any> =>
    deepClone(await client.call(method as any, req as any));
  const call$ = client.call$.bind(client);
  const stop = async (): Promise<void> => {
    await close?.();
  };
  return {call, call$, stop};
};

export const setupMemory = async () => {
  const store = new MemoryStore();
  return setup(store);
};

export const setupLevelMemory = async () => {
  const kv = new MemoryLevel<string, Uint8Array>({
    keyEncoding: 'utf8',
    valueEncoding: 'view',
  });
  const store = new LevelStore(<any>kv);
  return setup(store);
};

export const setupLevelClassic = async () => {
  // Use a unique temp directory per setup so each test is fully isolated: no
  // shared state or leftover data across tests/runs, and no `LOCK already held`
  // contention if one test fails before it can close its database.
  const dir = mkdtempSync(join(tmpdir(), 'json-crdt-server-level-'));
  const kv = new ClassicLevel<string, Uint8Array>(dir, {valueEncoding: 'view'});
  await kv.open();
  const store = new LevelStore(<any>kv);
  return setup(store, async () => {
    await kv.close();
    try {
      rmSync(dir, {recursive: true, force: true});
    } catch {}
  });
};

export type JsonCrdtTestSetup = typeof setup;
export type ApiTestSetup = typeof setupMemory;
