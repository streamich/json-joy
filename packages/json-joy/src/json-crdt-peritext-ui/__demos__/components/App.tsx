import * as React from 'react';
import {GlobalCss} from 'nano-theme';
import {NiceUiProvider} from '@jsonjoy.com/ui/lib/context';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../web/react';
import {CursorPlugin} from '../../plugins/cursor';
import {ToolbarPlugin} from '../../plugins/toolbar';
import {DebugPlugin} from '../../plugins/debug';
import {BlocksPlugin} from '../../plugins/blocks';
import {DebugState} from '../../plugins/debug/state';

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

export const App: React.FC = () => {
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new(''));
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    // const transfer = new PeritextDataTransfer(peritext);
    return [model, peritext] as const;
  });

  React.useEffect(() => {
    model.api.autoFlush(true);
    return () => {
      model.api.stopAutoFlush?.();
    };
  }, [model]);

  const plugins = React.useMemo(() => {
    const debugState = new DebugState();
    const cursorPlugin = new CursorPlugin();
    const toolbarPlugin = new ToolbarPlugin({debug: debugState});
    const blocksPlugin = new BlocksPlugin();
    const debugPlugin = new DebugPlugin({state: debugState});
    return [cursorPlugin, blocksPlugin, toolbarPlugin, debugPlugin];
  }, []);

  return (
    <NiceUiProvider>
      <GlobalCss />
      <div style={{maxWidth: '690px', fontSize: '21px', lineHeight: '1.7em', margin: '32px auto'}}>
        <PeritextView
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
      </div>
    </NiceUiProvider>
  );
};
