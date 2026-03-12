import * as React from 'react';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {PeritextEditor} from '.';
import {DebugPlugin} from '../plugins/debug';
import type {PeritextApi} from 'json-joy/src/json-crdt-extensions/peritext';

const plugins0 = [new DebugPlugin()];

export default {
  component: PeritextEditor,
  title: 'editor/<PeritextEditor>',
};

const markdown =
  'The German __automotive sector__ is in the process of *cutting ' +
  'thousands of jobs* as, [Google Docs](https://developers.google.com/workspace/docs), it grapples with a global shift toward electric vehicles ' +
  '— a transformation Musk himself has been at the forefront of.' +
  '\n\n' +
  '> To be, or not to be: that is the question.' +
  '\n\n' +
  'This is code block:' +
  '\n\n' +
  '```\n' +
  'console.log(123);\n' +
  '```\n' +
  '\n\n' +
  'A `ClipboardEvent` is [dispatched for copy](https://github.com/users/streamich/projects/5/views/2), cut, and paste events, and it contains ' +
  'a `clipboardData` property of type `DataTransfer`. The `DataTransfer` object ' +
  'is used by the Clipboard Events API to hold multiple representations of data.';

const Demo: React.FC = (props) => {
  const [[model, node]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new(''));
    const node = model.s.toExt();
    return [model, node as unknown as PeritextApi] as const;
  });

  React.useEffect(() => {
    model.api.autoFlush(true);
    return () => {
      model.api.stopAutoFlush?.();
    };
  }, [model]);

  return (
    <PeritextEditor
      node={node}
      plugins0={plugins0}
      onStart={(state) => {
        state.events.et.buffer({
          action: 'paste',
          format: 'md',
          at: [0],
          data: {
            text: markdown,
          },
        });
        state.peritext.refresh();
      }}
    />
  );
};

export const Default = {
  render: () => <Demo />,
};
