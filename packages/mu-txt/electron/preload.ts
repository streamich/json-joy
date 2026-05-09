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

type OpenFilePayload = {name: string; path: string; bytes?: Uint8Array};

const api = {
  platform: process.platform,
  versions: {...process.versions},
  openDialog: (): Promise<void> => ipcRenderer.invoke('mutxt:open-dialog'),
  writeFile: (path: string, bytes: Uint8Array): Promise<void> =>
    ipcRenderer.invoke('mutxt:write-file', path, bytes),
  onOpenFile: (cb: Listener<OpenFilePayload>): Unsubscribe => subscribe<OpenFilePayload>('mutxt:open-file', cb),
  onOpenUrl: (cb: Listener<string>): Unsubscribe => subscribe<string>('mutxt:open-url', cb),
  onCloseFile: (cb: () => void): Unsubscribe => subscribeVoid('mutxt:close-file', cb),
} as const;

export type MutxtBridge = typeof api;

contextBridge.exposeInMainWorld('mutxt', api);
