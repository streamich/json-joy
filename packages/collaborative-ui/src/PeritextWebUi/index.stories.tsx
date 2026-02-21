import * as React from 'react';
import {PeritextWebUi} from '.';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {DebugState} from './plugins/debug/state';
import {CursorPlugin} from './plugins/cursor';
import {defaultPlugin} from './plugins/minimal';
import {BlocksPlugin} from './plugins/blocks';
import {DebugPlugin} from './plugins/debug';
import type {PeritextPlugin} from './react/types';

export default {
  component: PeritextWebUi,
  title: '<PeritextWebUi>',
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

const Demo: React.FC<{plugins?: () => PeritextPlugin[]}> = (props) => {
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new(''));
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    return [model, peritext] as const;
  });

  React.useEffect(() => {
    model.api.autoFlush(true);
    return () => {
      model.api.stopAutoFlush?.();
    };
  }, [model]);

  const plugins = React.useMemo(() => {
    if (props.plugins) {
      return props.plugins();
    }
    const debugState = new DebugState();
    const cursorPlugin = new CursorPlugin();
    const blocksPlugin = new BlocksPlugin();
    const debugPlugin = new DebugPlugin({state: debugState});
    return [cursorPlugin, blocksPlugin, defaultPlugin, debugPlugin];
  }, []);

  return (
    <PeritextWebUi
      peritext={peritext}
      plugins={plugins}
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

export const DebugOn = {
  render: () => (
    <Demo
      plugins={() => {
        const debugState = new DebugState();
        debugState.enabled.next(true);
        const cursorPlugin = new CursorPlugin();
        const blocksPlugin = new BlocksPlugin();
        const debugPlugin = new DebugPlugin({state: debugState});
        return [cursorPlugin, blocksPlugin, defaultPlugin, debugPlugin];
      }}
    />
  ),
};

export const Empty = {
  render: () => <Demo plugins={() => []} />,
};

export const WithCursor = {
  render: () => (
    <Demo
      plugins={() => {
        const cursorPlugin = new CursorPlugin();
        const debugState = new DebugState();
        const debugPlugin = new DebugPlugin({state: debugState});
        return [cursorPlugin, debugPlugin];
      }}
    />
  ),
};

export const DebugOnly = {
  render: () => (
    <Demo
      plugins={() => {
        const debugState = new DebugState();
        debugState.enabled.next(true);
        const debugPlugin = new DebugPlugin({state: debugState});
        return [debugPlugin];
      }}
    />
  ),
};
