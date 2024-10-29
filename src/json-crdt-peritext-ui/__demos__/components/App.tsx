import * as React from 'react';
import {Provider, GlobalCss} from 'nano-theme';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../react';
import {renderers} from '../../renderers/default';
import {renderers as debugRenderers} from '../../renderers/debug';

export const App: React.FC = ({}) => {
  const [debug, setDebug] = React.useState(true);
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new('Hello world!'));
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    return [model, peritext] as const;
  });

  return (
    <Provider theme={'light'}>
      <GlobalCss />
      <div style={{maxWidth: '700px', margin: '0 auto'}}>
        <div style={{padding: '16px 16px 0'}}>
          <button onClick={() => setDebug((x) => !x)}>Toggle debug mode</button>
        </div>
        <PeritextView key={debug ? 'debug' : 'no-debug'} peritext={peritext} renderers={debug ? [debugRenderers, renderers] : [renderers]} />
      </div>
    </Provider>
  );
};
