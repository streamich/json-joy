import * as React from 'react';
import {GlobalCss} from 'nano-theme';
import {NiceUiProvider} from 'nice-ui/lib/context';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../react';
import {CursorPlugin} from '../../plugins/cursor';
import {ToolbarPlugin} from '../../plugins/toolbar';
import {DebugPlugin} from '../../plugins/debug';
import {BlocksPlugin} from '../../plugins/blocks';

const markdown =
  'The German __automotive sector__ is in the process of *cutting ' +
  'thousands of jobs* as it grapples with a global shift toward electric vehicles ' +
  '— a transformation Musk himself has been at the forefront of.' +
  '\n\n' +
  '> To be, or not to be: that is the question.' +
  '\n\n' +
  'A `ClipboardEvent` is dispatched for copy, cut, and paste events, and it contains ' +
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
    const cursorPlugin = new CursorPlugin();
    const toolbarPlugin = new ToolbarPlugin();
    const blocksPlugin = new BlocksPlugin();
    const debugPlugin = new DebugPlugin({enabled: true});
    return [cursorPlugin, toolbarPlugin, blocksPlugin, debugPlugin];
  }, []);

  return (
    <NiceUiProvider>
      <GlobalCss />
      <div style={{maxWidth: '690px', fontSize: '21px', lineHeight: '1.7em', margin: '32px auto'}}>
        <PeritextView
          peritext={peritext}
          plugins={plugins}
          onState={(state) => {
            state.events.et.buffer({
              action: 'paste',
              format: 'md',
              range: [0, 0],
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
