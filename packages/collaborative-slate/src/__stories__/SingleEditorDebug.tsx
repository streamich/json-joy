import * as React from 'react';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../sync/FromSlate';
import {SlateEditor} from './SlateEditor';
import type {Model, StrApi} from 'json-joy/lib/json-crdt';

interface UseModelProps<M extends Model<any>> {
  model: M;
  render: () => React.ReactNode;
}
const UseModel = <M extends Model<any>>({model, render}: UseModelProps<M>) => {
  const get = React.useCallback(() => model.tick, [model]);
  React.useSyncExternalStore(model.api.subscribe, get);
  return render();
};

export const SingleEditorDebug: React.FC = () => {
  const model = React.useMemo(() => {
    const slateDoc = [
      {type: 'paragraph', children: [{text: 'Hello, Slate!'}]},
      {type: 'paragraph', children: [
        {text: 'This is a basic '},
        {text: 'rich text', bold: true, italic: true},
        {text: ' editor.'},
      ]},
    ];
    const model = ModelWithExt.create(ext.peritext.new(''));
    const viewRange = FromSlate.convert(slateDoc as any);
    const txt = model.s.toExt().txt;
    txt.editor.merge(viewRange);
    txt.refresh();
    return model;
  }, []);

  return (
    <div>
      <SlateEditor model={model} />
      <div>
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
        }}>Prepend "1. " in 2 sec</button>
      </div>
      <UseModel model={model} render={() => (
        <pre style={{fontSize: '10px'}}>
          <code>{model.s.toExt().txt + ''}</code>
        </pre>
      )} />
    </div>
  );
};
