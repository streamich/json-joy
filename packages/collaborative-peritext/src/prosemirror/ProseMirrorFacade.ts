import {Plugin} from "prosemirror-state";
import {EditorView} from 'prosemirror-view';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {RichtextEditorFacade} from '../types';
import {FromPm} from "./FromPm";

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

  set(content: ViewRange): void {
    throw new Error("Method not implemented.");
  }

  onchange?: () => void;
  onselection?: () => void;

  dispose(): void {
    throw new Error("Method not implemented.");
  }
}
