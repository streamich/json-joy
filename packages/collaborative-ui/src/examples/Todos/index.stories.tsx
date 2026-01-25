import * as React from 'react';
import {Todos} from '.';
import {JsonCrdtModel} from '../../JsonCrdtModel';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {JsonCrdtLog} from '../../JsonCrdtLog';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {opt} from '../../util/opt';

export default {
  component: Todos,
  title: 'examples/<Todos>',
};

const ModelDemo: React.FC = () => {
  const [model, store] = React.useMemo(() => {
    const model = Model.create(
      s.obj({
        todos: s.obj({}),
      }),
    );
    const store = new JsonPatchStore(model, ['todos']);
    return [model, store];
  }, []);

  return <JsonCrdtModel model={model} renderDisplay={() => <Todos store={store} />} />;
};

export const Default = {
  render: () => <ModelDemo />,
};

const LogDemo: React.FC<{preview?: boolean}> = ({preview}) => {
  const [log] = React.useMemo(() => {
    const model = Model.create(
      s.obj({
        todos: s.obj({
          list: s.arr([]),
        }),
      }),
    );
    const log = Log.fromNewModel(model);
    log.end.api.autoFlush();
    return [log];
  }, []);

  return (
    <>
      {!!preview && (
        <div style={{display: 'flex', justifyContent: 'center', padding: '0 0 32px'}}>
          <Todos store={opt(() => new JsonPatchStore(log.end, ['todos']))} />
        </div>
      )}
      <JsonCrdtLog
        view={!preview ? 'model' : undefined}
        log={log}
        renderDisplay={(model) => {
          try {
            return <Todos store={new JsonPatchStore(model, ['todos'])} />;
          } catch {
            return null;
          }
        }}
      />
    </>
  );
};

export const History = {
  render: () => <LogDemo />,
};

export const HistoryWithPreview = {
  render: () => <LogDemo preview />,
};
