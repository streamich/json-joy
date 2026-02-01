import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {RichtextEditorFacade} from '../types';
import type {Node} from 'prosemirror-model';
import { Plugin } from "prosemirror-state";

const changeListenerPlugin = new Plugin({
  view() {
    return {
      update(view, prevState) {
        if (!view.state.doc.eq(prevState.doc)) {
          console.log("Document content has changed.");
        }
      },
      destroy() {
        
      }
    };
  }
});

export class ProsemirrorFacade implements RichtextEditorFacade {
  get(): ViewRange {

  }

  set(content: ViewRange): void {

  }

  onselection?: () => void = () => {};

  dispose(): void {

  }
}
