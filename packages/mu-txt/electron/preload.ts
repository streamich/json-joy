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

const api = {
  platform: process.platform,
  versions: {...process.versions},
  onOpenPath: (cb: Listener<string>): Unsubscribe => subscribe<string>('mutxt:open-path', cb),
  onOpenUrl: (cb: Listener<string>): Unsubscribe => subscribe<string>('mutxt:open-url', cb),
} as const;

export type MutxtBridge = typeof api;

contextBridge.exposeInMainWorld('mutxt', api);
