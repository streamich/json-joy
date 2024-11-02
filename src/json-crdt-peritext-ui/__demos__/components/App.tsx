import * as React from 'react';
import {Provider, GlobalCss} from 'nano-theme';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../react';
import {renderers} from '../../renderers/default';
import {renderers as debugRenderers} from '../../renderers/debug';

export const App: React.FC = () => {
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new('Hello world!'));
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    return [model, peritext] as const;
  });

  return (
    <Provider theme={'light'}>
      <GlobalCss />
      <div style={{maxWidth: '640px', fontSize: '21px', margin: '32px auto'}}>
        <PeritextView peritext={peritext} renderers={[debugRenderers({enabled: true}), renderers]} />
      </div>
    </Provider>
  );
};
