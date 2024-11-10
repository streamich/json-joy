import * as React from 'react';
import {Provider, GlobalCss} from 'nano-theme';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../react';
import {renderers} from '../../plugins/minimal';
import {renderers as debugRenderers} from '../../plugins/debug';

export const App: React.FC = () => {
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new('The German automotive sector is in the process of cutting thousands of jobs as it grapples with a global shift toward electric vehicles — a transformation Musk himself has been at the forefront of.'));
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    return [model, peritext] as const;
  });

  return (
    <Provider theme={'light'}>
      <GlobalCss />
      <div style={{maxWidth: '640px', fontSize: '21px', margin: '32px auto'}}>
        <PeritextView peritext={peritext} renderers={[renderers, debugRenderers({enabled: true})]} />
      </div>
    </Provider>
  );
};
