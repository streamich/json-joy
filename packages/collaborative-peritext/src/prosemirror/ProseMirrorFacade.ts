import {Plugin} from "prosemirror-state";
import {EditorView} from 'prosemirror-view';
import {FromPm} from "./FromPm";
import {toPm} from './toPm';
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {PmJsonNode} from './types';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {RichtextEditorFacade} from '../types';

export class ProseMirrorFacade implements RichtextEditorFacade {
  constructor(protected readonly view: EditorView) {
    const self = this;
    const peritextPlugin = new Plugin({
      view() {
        return {
          update(view, prevState) {
            console.log("update called");
            if (!view.state.doc.eq(prevState.doc)) {
              console.log("Document content has changed.");
              self.onchange?.();
            } else {
              self.onselection?.();
            }
          },
          destroy() {
            console.log("Plugin view destroyed.");
          }
        };
      },
    });
    const state = view.state;
    const updatedPlugins = state.plugins.concat([peritextPlugin]);
    const newState = state.reconfigure({ plugins: updatedPlugins });
    view.updateState(newState);
  }

  get(): ViewRange {
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
    const content: PmJsonNode[] = [];
    const newModelData: PmJsonNode = {type: 'doc', content};
    const children = fragment.root.children;
    const length = children.length;
    for (let i = 0; i < length; i++) content.push(toPm(children[i]));
    // console.log('content', content);
    const view = this.view;
    const state = view.state;
    const { tr, selection } = view.state;
    const newDoc = state.schema.nodeFromJSON(newModelData);
    tr.replaceWith(0, view.state.doc.content.size, newDoc);
    // const newSelection = selection.map(tr.doc, tr.mapping);
    // view.dispatch(tr.setSelection(newSelection));
  }

  onchange?: () => void;
  onselection?: () => void;

  dispose(): void {
    throw new Error("Method not implemented.");
  }
}
