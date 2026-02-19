import * as React from 'react';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {SlateEditor} from './SlateEditor';
import type {Model, StrApi} from 'json-joy/lib/json-crdt';

export const SingleEditorDebug: React.FC = () => {
  // const model = React.useMemo(() => {
  //   const json = {"type":"doc","content":[
  //     {"type":"paragraph","content":[{"type":"text","text":"Hello, ProseMirror!"}]},
  //     {"type":"paragraph","content":[
  //       {"type":"text","text":"This is a basic "},
  //       {"type":"text","text":"rich text","marks":[{"type":"strong"},{"type":"em"}]},
  //       {"type":"text","text":" editor."},
  //     ]}
  //   ]};
  //   const model = ModelWithExt.create(ext.peritext.new(''));
  //   const viewRange = FromPm.convert(mySchema.nodeFromJSON(json));
  //   const txt = model.s.toExt().txt;
  //   txt.editor.merge(viewRange);
  //   txt.refresh();
  //   return model;
  // }, []);

  return (
    <div>
      <SlateEditor />
      {/* <div>
        <div style={{height: 8}} />
        <button onClick={() => {
          const str = model.s.toExt().text() as StrApi;
          const pos = str.length();
          str.ins(pos > 0 ? 1 : 0, '1. ');
        }}>Prepend "1. "</button>
        {' '}
        <button onClick={() => {
          setTimeout(() => {
            const str = model.s.toExt().text() as StrApi;
            const pos = str.length();
            str.ins(pos > 0 ? 1 : 0, '1. ');
          }, 2000);
        }}>Prepend "1. " as 2 sec</button>
      </div>
      <UseModel model={model} render={() => (
        <pre style={{fontSize: '10px'}}>
          <code>{model.s.toExt().txt + ''}</code>
        </pre>
      )} /> */}
    </div>
  );
};
