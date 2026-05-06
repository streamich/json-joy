import * as React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {MuTxt, type MuTxtApi} from 'mutxt-react';

const HOST_STYLE_ID = 'mu-txt-host-style';

const ensureHostStyle = (): void => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(HOST_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HOST_STYLE_ID;
  style.textContent = 'mu-txt{display:block;box-sizing:border-box;width:100%;height:100%;min-height:320px;}';
  document.head.appendChild(style);
};

export class MuTxtElement extends HTMLElement {
  private _root: Root | null = null;
  private _mount: HTMLDivElement | null = null;
  private _api: MuTxtApi | undefined;
  private _readyResolvers: Array<(api: MuTxtApi) => void> = [];

  /** Public editor API. Available after the element has mounted. */
  public get api(): MuTxtApi | undefined {
    return this._api;
  }

  /** Resolves with the editor API once the editor has mounted. */
  public ready(): Promise<MuTxtApi> {
    if (this._api) return Promise.resolve(this._api);
    return new Promise((resolve) => this._readyResolvers.push(resolve));
  }

  public connectedCallback(): void {
    if (this._root) return;
    ensureHostStyle();
    const mount = document.createElement('div');
    mount.style.cssText = 'display:block;width:100%;height:100%;min-height:0;';
    this.appendChild(mount);
    this._mount = mount;
    const root = createRoot(mount);
    this._root = root;
    root.render(
      React.createElement(MuTxt, {
        heightFit: true,
        onApi: (api: MuTxtApi) => {
          this._api = api;
          const resolvers = this._readyResolvers;
          this._readyResolvers = [];
          for (const resolve of resolvers) resolve(api);
          this.dispatchEvent(new CustomEvent('ready', {detail: api}));
        },
      }),
    );
  }

  public disconnectedCallback(): void {
    const root = this._root;
    const mount = this._mount;
    this._root = null;
    this._mount = null;
    this._api = undefined;
    // Defer unmount: when the host element is removed from the DOM mid-render
    // (e.g. storybook story switch), calling root.unmount() synchronously
    // collides with the in-flight render. Microtask-defer to let the current
    // render commit first.
    if (root) {
      queueMicrotask(() => {
        try {
          root.unmount();
        } catch {}
      });
    }
    if (mount && mount.parentNode === this) this.removeChild(mount);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('mu-txt')) {
  customElements.define('mu-txt', MuTxtElement);
}

export default MuTxtElement;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mu-txt': React.DetailedHTMLProps<React.HTMLAttributes<MuTxtElement>, MuTxtElement>;
    }
  }
}
