import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtModel} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtModel';
import * as monaco from 'monaco-editor';
import {loader} from '@monaco-editor/react';
import {Editor} from './Editor';

loader.config({monaco});

const Demo: React.FC = () => {
  const model = React.useMemo(() => {
    return Model.create(
      s.str(
        'Integration of json-joy JSON CRDT with Monaco Editor.\n' +
          '\n' +
          'Enabling real-time collaborative plain-text editing.\n' +
          '\n' +
          'Type in either editor to see changes synchronized in real-time!\n',
      ),
    );
  }, []);

  return (
    <JsonCrdtModel
      model={model}
      noDisplayHdr
      renderDisplay={(m, readonly, presence) => (
        <Editor model={m} presence={presence} />
      )}
    />
  );
};

const meta = preview.meta({
  title: 'Monaco',
});

export const State = meta.story(() => <Demo />);
