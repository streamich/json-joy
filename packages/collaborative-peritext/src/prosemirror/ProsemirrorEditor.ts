import {Plugin} from "prosemirror-state";
import {EditorView} from 'prosemirror-view';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {RichtextEditorFacade} from '../types';

export class ProsemirrorFacade implements RichtextEditorFacade {
  constructor(protected readonly view: EditorView) {
    const peritextPlugin = new Plugin({
      view() {
        return {
          update(view, prevState) {
            console.log("update called");
            if (!view.state.doc.eq(prevState.doc)) {
              console.log("Document content has changed.");
            }
          },
          destroy() {
            
          }
        };
      }
    });
    const state = view.state;
    const updatedPlugins = state.plugins.concat([peritextPlugin]);
    const newState = state.reconfigure({ plugins: updatedPlugins });
    view.updateState(newState);
  }

  get(): ViewRange {
    throw new Error("Method not implemented.");
  }

  set(content: ViewRange): void {
    throw new Error("Method not implemented.");
  }

  onselection?: () => void = () => {
    throw new Error("Method not implemented.");
  };

  dispose(): void {
    throw new Error("Method not implemented.");
  }
}
