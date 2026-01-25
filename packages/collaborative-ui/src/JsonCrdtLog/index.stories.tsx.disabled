import * as React from 'react';
import {JsonCrdtLog} from '.';
import {log2, log3, log4} from '../__tests__/fixtures';
import type {Model} from 'json-joy/lib/json-crdt';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeMonaco} from '../MonacoEditor';
import {CollaborativeInput} from '../CollaborativeInput';
import {opt} from '../util/opt';
import {Todos} from '../examples/Todos';
import {Blogpost} from '../examples/Blogpost';
import {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';

export default {
  component: JsonCrdtLog,
  title: '<JsonCrdtLog>',
};

export const Default = {
  render: () => <JsonCrdtLog log={log2} />,
};

const MonacoDemo = () => {
  const [model, setModel] = React.useState<Model<any>>();

  return (
    <div>
      <div>
        {!!model && (
          <CollaborativeMonaco
            str={() => model.api.str([])}
            style={{
              width: '100%',
              height: '75vh',
            }}
          />
        )}
      </div>
      <JsonCrdtLog log={log2} onModel={(model) => setModel(model)} />
    </div>
  );
};

export const Monaco = {
  render: () => <MonacoDemo />,
};

const TextareaDemo = () => {
  const [model, setModel] = React.useState<Model<any>>();

  return (
    <div>
      <div>
        {!!model && !!opt(() => model.api.str([])) && (
          <CollaborativeInput
            multiline
            str={() => opt(() => model.api.str([]))}
            style={{
              width: '100%',
              height: '50vh',
            }}
          />
        )}
      </div>
      <JsonCrdtLog log={log2} onModel={(model) => setModel(model)} />
    </div>
  );
};

export const Textarea = {
  render: () => <TextareaDemo />,
};

const TodoDemo = () => {
  const [store, setStore] = React.useState<JsonPatchStore>();

  return (
    <div>
      <div>{!!store && <Todos store={store} />}</div>
      <JsonCrdtLog log={log3} onModel={(model) => setStore(new JsonPatchStore(model))} />
    </div>
  );
};

export const Todo = {
  render: () => <TodoDemo />,
};

const BlogPostDemo = () => {
  const [model, setModel] = React.useState<Model<any>>();

  return (
    <div>
      <button
        type={'button'}
        onClick={async () => {
          const res = await fetch('https://appsets.jsonjoy.com/traces/todos.seq.cbor.gz');
          console.log('res', res);
          const blob = await res.blob();
          console.log('blob', blob);
        }}
      >
        Load adsfsadf asdf
      </button>
      <div>{!!model && <Blogpost model={model} />}</div>
      <JsonCrdtLog log={log4} onModel={(model) => setModel(model)} />
    </div>
  );
};

export const BlogPost = {
  render: () => <BlogPostDemo />,
};

const QuillDemo = () => {
  const [model, setModel] = React.useState<Model<any>>();
  // biome-ignore lint: manual dependency list
  const log = React.useMemo(() => {
    const model = ModelWithExt.create(ModelWithExt.ext.quill.new(''));
    const log = Log.fromNewModel(model);
    const start = log.start;
    log.start = () => {
      const model = start();
      model.ext.register(ext.quill);
      return model;
    };
    log.end.ext.register(ext.quill);
    log.end.api.autoFlush();
    return log;
  }, ['']);

  return (
    <div>
      <div>
        {!!model && (
          <CollaborativeQuill
            api={() => (model.s as any).toExt()}
            style={{
              width: '100%',
              height: '300px',
            }}
          />
        )}
      </div>
      <br />
      <JsonCrdtLog log={log} onModel={(model) => setModel(model)} />
    </div>
  );
};

export const Quill = {
  render: () => <QuillDemo />,
};
