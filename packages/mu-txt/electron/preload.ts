import {contextBridge, ipcRenderer, type IpcRendererEvent} from 'electron';

type Listener<T> = (value: T) => void;
type Unsubscribe = () => void;

const subscribe = <T>(channel: string, cb: Listener<T>): Unsubscribe => {
  const listener = (_event: IpcRendererEvent, value: T) => cb(value);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.off(channel, listener);
  };
};

const subscribeVoid = (channel: string, cb: () => void): Unsubscribe => {
  const listener = () => cb();
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.off(channel, listener);
  };
};

type OpenFilePayload = {name: string; bytes: Uint8Array};

const api = {
  platform: process.platform,
  versions: {...process.versions},
  onOpenFile: (cb: Listener<OpenFilePayload>): Unsubscribe => subscribe<OpenFilePayload>('mutxt:open-file', cb),
  onOpenUrl: (cb: Listener<string>): Unsubscribe => subscribe<string>('mutxt:open-url', cb),
  onCloseFile: (cb: () => void): Unsubscribe => subscribeVoid('mutxt:close-file', cb),
} as const;

export type MutxtBridge = typeof api;

contextBridge.exposeInMainWorld('mutxt', api);
