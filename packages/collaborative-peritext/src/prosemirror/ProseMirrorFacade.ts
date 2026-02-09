import {Plugin, PluginKey} from "prosemirror-state";
import {EditorView} from 'prosemirror-view';
import {FromPm} from "./FromPm";
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {ToPmNode} from "./toPmNode";
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {RichtextEditorFacade} from '../types';

const SYNC_PLUGIN_KEY = new PluginKey('jsonjoy.com/json-crdt/sync');

export class ProseMirrorFacade implements RichtextEditorFacade {
  _disposed = false;
  _plugin: Plugin;
  toPm: ToPmNode;

  onchange?: () => void;
  onselection?: () => void;

  constructor(protected readonly view: EditorView) {
    const self = this;
    const state = view.state;
    const plugin = this._plugin = new Plugin({
      key: SYNC_PLUGIN_KEY,
      view() {
        return {
          /** ProseMirror local changes by the user. */
          update(view, prevState) {
            if (self._disposed) return;
            const isModelChange = state.doc.eq(prevState.doc);
            if (isModelChange) {
              // TODO: filter out `origin: 'remote'` changes to avoid infinite loop.
              self.onchange?.();
            }
            else self.onselection?.();
            // console.log(view.state.doc.toJSON());
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
    console.log(fragment + '');
    const pmNode = this.toPm.convert(fragment);
    const view = this.view;
    const state = view.state;
    const transaction = state.tr.replaceWith(0, state.doc.content.size, pmNode)
    transaction.setMeta(SYNC_PLUGIN_KEY, {origin: 'remote'});
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
