import * as React from 'react';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema} from 'prosemirror-model';
import {schema} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {exampleSetup} from 'prosemirror-example-setup';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import {ProseMirrorFacade} from './ProseMirrorFacade';
import {PeritextBinding} from '../PeritextBinding';
import {FromPm} from './FromPm';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import type {Model, JsonNode} from 'json-joy/lib/json-crdt';

export interface UseModelProps<N extends JsonNode = JsonNode<any>> {
  model: Model<N>;
  render: () => React.ReactNode;
}

export const UseModel: React.FC<UseModelProps> = ({model, render}) => {
  const get = React.useCallback(() => model.tick, [model]);
  React.useSyncExternalStore(model.api.subscribe, get);
  return render();
};

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
  const viewRef = React.useRef<EditorView | null>(null);
  const modelRef = React.useRef<Model<any> | null>(null);
  const [cnt, setCnt] = React.useState(0);

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

    // Create Model
    const json = {"type":"doc","content":[
      {"type":"paragraph","content":[{"type":"text","text":"Hello, ProseMirror!"}]},
      {"type":"paragraph","content":[
        {"type":"text","text":"This is a basic "},
        {"type":"text","text":"rich text","marks":[{"type":"strong"},{"type":"em"}]},
        {"type":"text","text":" editor."},
      ]}
    ]};
    const model = modelRef.current = ModelWithExt.create(ext.peritext.new(''));
    const viewRange = FromPm.convert(mySchema.nodeFromJSON(json));
    const txt = model.s.toExt().txt;
    txt.editor.merge(viewRange);
    txt.refresh();

    // Bind Model to ProseMirror
    const facade = new ProseMirrorFacade(view);
    const unbind = PeritextBinding.bind(() => model.s.toExt(), facade);

    // Re-render after setup
    setCnt(x => x + 1);
    
    return () => {
      unbind();
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return (
    <div>
      <div
        ref={editorRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          minHeight: '200px',
        }}
      />
      <div>
        <button onClick={() => {
          (modelRef.current?.s as any).toExt().text().ins(0, '1. ');
        }}>Prepend "1. "</button>
        <button onClick={() => {
          setTimeout(() => {
            (modelRef.current?.s as any).toExt().text().ins(0, '1. ');
          }, 2000);
        }}>Prepend "1. " as 2 sec</button>
      </div>
      {!!modelRef.current && (
        <UseModel model={modelRef.current} render={() => (
          <pre style={{fontSize: '10px'}}>
            <code>{(modelRef.current as any)?.s.toExt().txt + ''}</code>
          </pre>
        )} />
      )}
    </div>
  );
};

export const Default = {
  render: Demo,
};
