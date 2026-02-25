import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {Model, s} from 'json-joy/lib/json-crdt';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog';
import * as monaco from 'monaco-editor';
import {loader} from '@monaco-editor/react';
import {Editor} from './Editor';

loader.config({monaco});

const Demo: React.FC = () => {
  const log = React.useMemo(() => {
    const model = Model.create(
      s.str(
        'Integration of json-joy JSON CRDT with Monaco Editor.\n' +
          '\n' +
          'Enabling real-time collaborative plain-text editing.\n' +
          '\n' +
          'Type in either editor to see changes synchronized in real-time!\n',
      ),
    );
    const log = Log.fromNewModel(model);
    log.end.api.autoFlush();
    return log;
  }, []);

  return (
    <JsonCrdtLog
      log={log}
      view={'model'}
      renderDisplay={(m, readonly, presence) => <Editor model={m} presence={presence} />}
    />
  );
};

const meta = preview.meta({
  title: 'Monaco',
});

export const StateLog = meta.story(() => <Demo />);
