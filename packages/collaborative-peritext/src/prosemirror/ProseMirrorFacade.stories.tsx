import * as React from 'react';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, DOMParser} from 'prosemirror-model';
import {schema} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {exampleSetup} from 'prosemirror-example-setup';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import {ProseMirrorFacade} from './ProseMirrorFacade';
import {PeritextBinding} from '../PeritextBinding';
import {FromPm} from './FromPm';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {Model} from 'json-joy/lib/json-crdt';

export default {
  title: 'Peritext/ProseMirrorFacade',
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
  const modelRef = React.useRef<Model<any> | null>(null);
  const [cnt, setCnt] = React.useState(0);

  React.useEffect(() => {
    if (!editorRef.current || !contentRef.current) return;
    if (viewRef.current) return;

    // Create ProseMirror editor
    // const doc = mySchema.nodes.doc.createAndFill()!;
    // const doc = DOMParser.fromSchema(mySchema).parse({})
    const doc = DOMParser.fromSchema(mySchema).parse(contentRef.current);
    const view = viewRef.current = new EditorView(editorRef.current, {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({schema: mySchema}),
      }),
    });

    // console.log(doc.toJSON())
    
    // Connect ProseMirror with Peritext
    const facade = new ProseMirrorFacade(view);
    const model = modelRef.current = ModelWithExt.create(ext.peritext.new(''));
    const txt = model.s.toExt().txt;
    const viewRange = FromPm.convert(view.state.doc);
    txt.editor.merge(viewRange);
    txt.refresh();
    const unbind = PeritextBinding.bind(() => model.s.toExt(), facade);
    
    return () => {
      unbind();
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
      <button onClick={() => setCnt(cnt + 1)}>update</button>
      <pre style={{fontSize: '10px'}}>
        <code>{(modelRef.current as any)?.s.toExt().txt + ''}</code>
      </pre>
    </div>
  );
};

export const Default = {
  render: Demo,
};
