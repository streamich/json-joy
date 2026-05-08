export interface MutxtHost {
  readonly platform: 'darwin' | 'win32' | 'linux' | (string & {});
  readonly versions: Readonly<Record<string, string | undefined>>;
  onOpenFile(cb: (file: {name: string; bytes: Uint8Array}) => void): () => void;
  onOpenUrl(cb: (url: string) => void): () => void;
  /** Fires when the user presses Cmd/Ctrl+W. */
  onCloseFile(cb: () => void): () => void;
}

declare global {
  interface Window {
    mutxt?: MutxtHost;
  }
}

export const host: MutxtHost | null = typeof window !== 'undefined' && window.mutxt ? window.mutxt : null;

export const isElectron = host !== null;
export const isMacElectron = isElectron && host!.platform === 'darwin';

export const TITLEBAR_INSET_PX = 78;

if (typeof document !== 'undefined') {
  const value = isMacElectron ? `${TITLEBAR_INSET_PX}px` : 'env(titlebar-area-x, 0px)';
  document.documentElement.style.setProperty('--titlebar-inset-left', value);
}
