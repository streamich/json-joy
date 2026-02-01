import * as React from 'react';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, DOMParser} from 'prosemirror-model';
import {schema} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {exampleSetup} from 'prosemirror-example-setup';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';

export default {
  title: 'Peritext/ProsemirrorEditor',
};

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

const Demo: React.FC = () => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<EditorView | null>(null);

  React.useEffect(() => {
    if (!editorRef.current || !contentRef.current) return;
    if (viewRef.current) return;

    const view = new EditorView(editorRef.current, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(contentRef.current),
        plugins: exampleSetup({schema: mySchema}),
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return (
    <div>
      <div ref={contentRef} style={{display: 'none'}}>
        <p>Hello, ProseMirror!</p>
        <p>This is a basic rich text editor.</p>
      </div>
      <div
        ref={editorRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          minHeight: '200px',
        }}
      />
    </div>
  );
};

export const Default = {
  render: Demo,
};
