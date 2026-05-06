import * as React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {MuTxt, type MuTxtApi, type SlateEditorDocument} from 'mu-txt-react';
import {ensureHostStyle, loadFromSrc, resolveFormat, seedFromChildren} from './util';
import type {MuTxtFormat, SeedProps} from './types';

export type {MuTxtFormat} from './types';

export class MuTxtElement extends HTMLElement {
  private _root: Root | null = null;
  private _mount: HTMLDivElement | null = null;
  private _api: MuTxtApi | undefined;
  private _readyResolvers: Array<(api: MuTxtApi) => void> = [];
  private _fromSlate: SlateEditorDocument | undefined;
  private _abortController: AbortController | null = null;

  /** Public editor API. Available after the element has mounted. */
  public get api(): MuTxtApi | undefined {
    return this._api;
  }

  /**
   * Programmatic Slate seed. Equivalent to `<mu-txt format="slate">{JSON}</mu-txt>`
   * but takes a JS array directly. Set BEFORE the element is connected to the
   * DOM. Ignored when `src` is present.
   */
  public get fromSlate(): SlateEditorDocument | undefined {
    return this._fromSlate;
  }
  public set fromSlate(value: SlateEditorDocument | undefined) {
    this._fromSlate = value;
  }

  /** Resolves with the editor API once the editor has mounted. */
  public ready(): Promise<MuTxtApi> {
    if (this._api) return Promise.resolve(this._api);
    return new Promise((resolve) => this._readyResolvers.push(resolve));
  }

  private mountReact(seed: SeedProps): void {
    if (!this._mount) return;
    const root = createRoot(this._mount);
    this._root = root;
    root.render(
      React.createElement(MuTxt, {
        heightFit: true,
        fromSlate: seed.fromSlate,
        obj: seed.obj,
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

  public connectedCallback(): void {
    if (this._root) return;
    // Defer: React 19 inserts custom elements into the DOM BEFORE appending
    // their child text nodes, so reading `textContent` synchronously here
    // would miss the seed. The microtask runs after React's commit phase
    // completes - by then children are present.
    queueMicrotask(() => this.init());
  }

  private init(): void {
    if (this._root) return;
    if (!this.isConnected) return; // disconnected before microtask ran
    ensureHostStyle();
    // Capture seed inputs before mutating the DOM.
    const childrenText = this.textContent ?? '';
    const hasChildren = !!childrenText.trim();
    const formatAttr = this.getAttribute('format');
    const srcAttr = this.getAttribute('src');
    const format = resolveFormat(formatAttr, srcAttr, hasChildren, !!this._fromSlate);
    // Clear seed text/JSON children so they don't flash before React mounts.
    while (this.firstChild) this.removeChild(this.firstChild);
    const mount = document.createElement('div');
    mount.style.cssText = 'display:block;width:100%;height:100%;min-height:0;';
    this.appendChild(mount);
    this._mount = mount;
    if (srcAttr && format) {
      const controller = new AbortController();
      this._abortController = controller;
      loadFromSrc(srcAttr, format, controller.signal)
        .then((seed) => this.mountReact(seed))
        .catch((err) => {
          if (err && err.name === 'AbortError') return;
          // eslint-disable-next-line no-console
          console.error('[mu-txt] failed to load src:', err);
          this.mountReact({});
        });
    } else {
      this.mountReact(seedFromChildren(format, childrenText, this._fromSlate));
    }
  }

  public disconnectedCallback(): void {
    this._abortController?.abort();
    this._abortController = null;
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
      'mu-txt': React.DetailedHTMLProps<React.HTMLAttributes<MuTxtElement>, MuTxtElement> & {
        format?: MuTxtFormat;
        src?: string;
      };
    }
  }
}
