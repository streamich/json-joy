import {Plugin, PluginKey} from "prosemirror-state";
import {EditorView} from 'prosemirror-view';
import {FromPm} from "./FromPm";
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {ToPmNode} from "./toPmNode";
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {PeritextRef, RichtextEditorFacade} from '../types';

const SYNC_PLUGIN_KEY = new PluginKey<{}>('jsonjoy.com/json-crdt/sync');

const enum TransactionOrigin {
  UNKNOWN,
  LOCAL,
  REMOTE,
}

interface TransactionMeta {
  orig?: TransactionOrigin;
}

export class ProseMirrorFacade implements RichtextEditorFacade {
  _disposed = false;
  _plugin: Plugin;
  toPm: ToPmNode;
  txOrig: TransactionOrigin = TransactionOrigin.UNKNOWN;

  onchange?: () => (PeritextRef | void);
  onselection?: () => void;

  constructor(protected readonly view: EditorView) {
    const self = this;
    const state = view.state;
    const plugin = this._plugin = new Plugin({
      key: SYNC_PLUGIN_KEY,
      state: {
        init() { return {}; },
        apply(transaction, value) {
          const meta = transaction.getMeta(SYNC_PLUGIN_KEY) as TransactionMeta | undefined;
          self.txOrig = meta?.orig || TransactionOrigin.UNKNOWN;
          return value;
        },
      },
      view() {
        return {
          update(view, prevState) {
            if (self._disposed) return;
            const origin = self.txOrig;
            self.txOrig = TransactionOrigin.UNKNOWN;
            if (origin === TransactionOrigin.REMOTE) return;
            const docChanged = !prevState.doc.eq(view.state.doc);
            if (docChanged) {
              const ref = self.onchange?.();
              KEEP_CACHE_WARM: {
                const peritext = ref?.();
                if (!peritext) break KEEP_CACHE_WARM;
                const txt = peritext.txt;
                const peritextChildren = txt.blocks.root.children;
                const length = peritextChildren.length;
                const pmDoc = view.state.doc;
                if (pmDoc.childCount !== length) break KEEP_CACHE_WARM;
                const cache = self.toPm.cache;
                // TODO: PERF: sync up only changed blocks instead of the whole document
                for (let i = 0; i < length; i++)
                  cache.set(peritextChildren[i].hash, pmDoc.child(i));
                cache.gc();
              }
            } else {
              const selectionChanged = !prevState.selection.eq(view.state.selection)
              if (selectionChanged) self.onselection?.();
            }
          },
          destroy() {
            self._disposed = true;
          }
        };
      },
    });
    this.toPm = new ToPmNode(state.schema);
    const updatedPlugins = state.plugins.concat([plugin]);
    const newState = state.reconfigure({ plugins: updatedPlugins });
    view.updateState(newState);
  }

  get(): ViewRange {
    if (this._disposed) return ['', 0, []]
    const doc = this.view.state.doc;
    return FromPm.convert(doc);
  }

  set(fragment: Fragment<string>): void {
    if (this._disposed) return;
    const pmNode = this.toPm.convert(fragment);
    const view = this.view;
    const state = view.state;
    const transaction = state.tr.replaceWith(0, state.doc.content.size, pmNode)
    const meta: TransactionMeta = {orig: TransactionOrigin.REMOTE};
    transaction.setMeta(SYNC_PLUGIN_KEY, meta);
    view.dispatch(transaction)
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    const state = this.view.state;
    const plugins = state.plugins.filter(p => p !== this._plugin);
    const newState = state.reconfigure({ plugins });
    this.view.updateState(newState);
  }
}
