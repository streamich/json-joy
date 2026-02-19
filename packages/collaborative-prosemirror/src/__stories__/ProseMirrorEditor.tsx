import * as React from 'react';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema} from 'prosemirror-model';
import {schema} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {exampleSetup} from 'prosemirror-example-setup';
import {ProseMirrorFacade} from '../ProseMirrorFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';
import type {Model} from 'json-joy/lib/json-crdt';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

export interface ProseMirrorEditorProps {
  model: Model<any>;
  readonly?: boolean;
  presence?: PresenceManager;
  onEditor?: (editor: EditorView) => void;
}

export const ProseMirrorEditor: React.FC<ProseMirrorEditorProps> = ({model, readonly, presence, onEditor}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<EditorView | null>(null);
  const [, setCnt] = React.useState(0);

  React.useEffect(() => {
    if (!editorRef.current) return;
    if (viewRef.current) return;

    // Create ProseMirror editor
    const doc = mySchema.nodes.doc.createAndFill()!;
    const view = viewRef.current = new EditorView(editorRef.current, {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({schema: mySchema}),
      }),
    });

    // Bind Model to ProseMirror
    const peritextRef = () => (model as any).s.toExt();
    const facade = new ProseMirrorFacade(view, peritextRef, {presence});
    const unbind = PeritextBinding.bind(peritextRef, facade);

    // Re-render after setup
    setCnt(x => x + 1);
    if (onEditor) {
      onEditor(view);
    }
    
    return () => {
      unbind();
      view.destroy();
      viewRef.current = null;
    };
  }, [model, presence, onEditor]);

  return (
    <div
      ref={editorRef}
      style={{
        border: '1px solid #bbb',
        borderRadius: '4px',
        width: '100%',
        minHeight: '200px',
      }}
    />
  );
};
