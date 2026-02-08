import {Plugin} from "prosemirror-state";
import {EditorView} from 'prosemirror-view';
import {FromPm} from "./FromPm";
import {toPm} from './toPm';
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {PmJsonNode} from './types';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {RichtextEditorFacade} from '../types';

export class ProseMirrorFacade implements RichtextEditorFacade {
  _disposed = false;
  _plugin: Plugin;

  onchange?: () => void;
  onselection?: () => void;

  constructor(protected readonly view: EditorView) {
    const self = this;
    const plugin = this._plugin = new Plugin({
      view() {
        return {
          update(view, prevState) {
            if (self._disposed) return;
            const isModelChange = !view.state.doc.eq(prevState.doc);
            if (isModelChange) self.onchange?.();
            else self.onselection?.();
            // console.log(view.state.doc.toJSON());
          },
          destroy() {
            self._disposed = true;
          }
        };
      },
    });
    const state = view.state;
    const updatedPlugins = state.plugins.concat([plugin]);
    const newState = state.reconfigure({ plugins: updatedPlugins });
    view.updateState(newState);
  }

  get(): ViewRange {
    if (this._disposed) return ['', 0, []]
    const doc = this.view.state.doc;
    return FromPm.convert(doc);
  }

  /**
   * @todo Replacement strategies:
   *   1. `tr.replaceWith(0, doc.content.size, newDoc)` - Replace entire document content.
   *   2. Replace the entire "state" of ProseMirror (including selection).
   *   3. Use `prosemirror-recreate-transform` package to diff and recreate the document with minimal changes.
   */
  set(fragment: Fragment<string>): void {
    if (this._disposed) return;
    const content: PmJsonNode[] = [];
    const newModelData: PmJsonNode = {type: 'doc', content};
    const children = fragment.root.children;
    const length = children.length;
    for (let i = 0; i < length; i++) content.push(toPm(children[i]));
    const view = this.view;
    const state = view.state;
    const { tr } = view.state;
    const newDoc = state.schema.nodeFromJSON(newModelData);
    tr.replaceWith(0, view.state.doc.content.size, newDoc);
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
